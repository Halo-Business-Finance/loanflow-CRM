import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LOAN_TYPES, STAGES, PRIORITIES } from "@/types/lead"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"

export default function NewLead() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZipCode: "",
    loanAmount: "",
    loanType: "",
    stage: "Initial Contact",
    priority: "Medium",
    creditScore: "",
    annualRevenue: "",
    yearEstablished: "",
    naicsCode: "",
    ownershipStructure: "",
    notes: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a lead",
        variant: "destructive"
      })
      return
    }

    try {
      // Create contact entity first
      const contactData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        business_name: formData.businessName,
        business_address: formData.businessAddress,
        business_city: formData.businessCity,
        business_state: formData.businessState,
        business_zip_code: formData.businessZipCode,
        annual_revenue: formData.annualRevenue ? Number(formData.annualRevenue) : undefined,
        loan_amount: formData.loanAmount ? Number(formData.loanAmount) : undefined,
        loan_type: formData.loanType,
        credit_score: formData.creditScore ? Number(formData.creditScore) : undefined,
        priority: formData.priority.toLowerCase(),
        stage: formData.stage,
        notes: formData.notes,
        naics_code: formData.naicsCode,
        ownership_structure: formData.ownershipStructure,
        user_id: user.id
      }

      const { data: contactEntity, error: contactError } = await supabase
        .from('contact_entities')
        .insert(contactData)
        .select()
        .single()

      if (contactError) {
        throw new Error(`Failed to create contact: ${contactError.message}`)
      }

      // Create lead record
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          contact_entity_id: contactEntity.id
        })
        .select()
        .single()

      if (leadError) {
        throw new Error(`Failed to create lead: ${leadError.message}`)
      }

      // Create audit log entry for lead creation
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'lead_created',
          table_name: 'leads',
          record_id: leadData.id,
          new_values: {
            name: `${formData.firstName} ${formData.lastName}`,
            business_name: formData.businessName,
            email: formData.email,
            phone: formData.phone
          }
        })

      toast({
        title: "Lead Created",
        description: "New lead has been added to your pipeline",
      })

      // Navigate to the lead detail page
      navigate(`/leads/${leadData.id}`)

    } catch (error: any) {
      console.error('Error creating lead:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create lead",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Enterprise Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Create New Lead
            </h1>
            <p className="text-[#525252] mt-1">
              Add a new lead to your SBA & Commercial Loan pipeline
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/leads')}
          >
            Back to Leads
          </Button>
        </div>

        <div className="grid gap-6 max-w-5xl">
        {/* Contact Information */}
        <Card className="bg-white border border-[#e0e0e0]">
          <CardHeader>
            <CardTitle className="text-base font-normal text-[#161616]">Contact Information</CardTitle>
            <CardDescription className="text-[#525252]">
              Primary contact details for the borrower
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-[#161616]">First Name *</Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-[#161616]">Last Name *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#161616]">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#161616]">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="bg-white border border-[#e0e0e0]">
          <CardHeader>
            <CardTitle className="text-base font-normal text-[#161616]">Business Information</CardTitle>
            <CardDescription className="text-[#525252]">
              Details about the borrower's business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-[#161616]">Business Name</Label>
              <Input 
                id="businessName" 
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                className="border-[#e0e0e0]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress" className="text-sm font-medium text-[#161616]">Business Address</Label>
              <Input 
                id="businessAddress" 
                placeholder="Enter business address"
                value={formData.businessAddress}
                onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                className="border-[#e0e0e0]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessCity" className="text-sm font-medium text-[#161616]">City</Label>
                <Input 
                  id="businessCity" 
                  placeholder="City"
                  value={formData.businessCity}
                  onChange={(e) => handleInputChange("businessCity", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessState" className="text-sm font-medium text-[#161616]">State</Label>
                <Input 
                  id="businessState" 
                  placeholder="State"
                  value={formData.businessState}
                  onChange={(e) => handleInputChange("businessState", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessZipCode" className="text-sm font-medium text-[#161616]">Zip Code</Label>
                <Input 
                  id="businessZipCode" 
                  placeholder="Zip Code"
                  value={formData.businessZipCode}
                  onChange={(e) => handleInputChange("businessZipCode", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="yearEstablished" className="text-sm font-medium text-[#161616]">Year Established</Label>
                <Input 
                  id="yearEstablished" 
                  type="number"
                  placeholder="YYYY"
                  value={formData.yearEstablished}
                  onChange={(e) => handleInputChange("yearEstablished", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="naicsCode" className="text-sm font-medium text-[#161616]">NAICS Code</Label>
                <Input 
                  id="naicsCode" 
                  placeholder="Enter NAICS code"
                  value={formData.naicsCode}
                  onChange={(e) => handleInputChange("naicsCode", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownershipStructure" className="text-sm font-medium text-[#161616]">Ownership Structure</Label>
              <Select value={formData.ownershipStructure} onValueChange={(value) => handleInputChange("ownershipStructure", value)}>
                <SelectTrigger className="border-[#e0e0e0]">
                  <SelectValue placeholder="Select ownership structure" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="Corporation">Corporation</SelectItem>
                  <SelectItem value="S-Corp">S-Corp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loan Information */}
        <Card className="bg-white border border-[#e0e0e0]">
          <CardHeader>
            <CardTitle className="text-base font-normal text-[#161616]">Loan Information</CardTitle>
            <CardDescription className="text-[#525252]">
              Loan requirements and financial details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="loanAmount" className="text-sm font-medium text-[#161616]">Loan Amount</Label>
                <Input 
                  id="loanAmount" 
                  type="number"
                  placeholder="Enter loan amount"
                  value={formData.loanAmount}
                  onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanType" className="text-sm font-medium text-[#161616]">Loan Type</Label>
                <Select value={formData.loanType} onValueChange={(value) => handleInputChange("loanType", value)}>
                  <SelectTrigger className="border-[#e0e0e0]">
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {LOAN_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="annualRevenue" className="text-sm font-medium text-[#161616]">Annual Revenue</Label>
                <Input 
                  id="annualRevenue" 
                  type="number"
                  placeholder="Enter annual revenue"
                  value={formData.annualRevenue}
                  onChange={(e) => handleInputChange("annualRevenue", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditScore" className="text-sm font-medium text-[#161616]">Credit Score</Label>
                <Input 
                  id="creditScore" 
                  type="number"
                  placeholder="Enter credit score"
                  value={formData.creditScore}
                  onChange={(e) => handleInputChange("creditScore", e.target.value)}
                  className="border-[#e0e0e0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stage" className="text-sm font-medium text-[#161616]">Loan Stage</Label>
                <Select value={formData.stage} onValueChange={(value) => handleInputChange("stage", value)}>
                  <SelectTrigger className="border-[#e0e0e0]">
                    <SelectValue placeholder="Select loan stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {STAGES.filter(stage => stage !== "All").map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-[#161616]">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className="border-[#e0e0e0]">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {PRIORITIES.filter(priority => priority !== "All").map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-white border border-[#e0e0e0]">
          <CardHeader>
            <CardTitle className="text-base font-normal text-[#161616]">Additional Information</CardTitle>
            <CardDescription className="text-[#525252]">
              Any additional notes or comments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-[#161616]">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any additional notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="border-[#e0e0e0]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end pb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/leads')}
            className="text-[#525252]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-[#0f62fe] hover:bg-[#0353e9] text-white px-8"
          >
            Create Lead
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}