import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { LOAN_TYPES, STAGES, PRIORITIES } from "@/types/lead"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useSecureForm } from "@/hooks/useSecureForm"

export default function NewLead() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobilePhone: "",
    personalEmail: "",
    homeAddress: "",
    homeCity: "",
    homeState: "",
    homeZipCode: "",
    
    // Business Information
    businessName: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZipCode: "",
    yearEstablished: "",
    naicsCode: "",
    ownershipStructure: "",
    ownershipPercentage: "",
    
    // Financial Information
    annualRevenue: "",
    income: "",
    creditScore: "",
    existingLoanAmount: "",
    netOperatingIncome: "",
    propertyPaymentAmount: "",
    ownsProperty: false,
    
    // Loan Information
    loanAmount: "",
    loanType: "",
    interestRate: "",
    
    // Merchant Processing
    posSystem: "",
    processorName: "",
    currentProcessingRate: "",
    monthlyProcessingVolume: "",
    averageTransactionSize: "",
    
    // Banking & BDO
    bdoName: "",
    bdoTelephone: "",
    bdoEmail: "",
    bankLenderName: "",
    
    // Lead Management
    stage: "Initial Contact",
    priority: "Medium",
    notes: "",
    callNotes: ""
  })

  const [displayValues, setDisplayValues] = useState({
    income: "",
    annualRevenue: "",
    existingLoanAmount: "",
    netOperatingIncome: "",
    propertyPaymentAmount: ""
  })

  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (!numbers) return ''
    return Number(numbers).toLocaleString('en-US')
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCurrencyChange = (field: string, value: string) => {
    const numbers = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({ ...prev, [field]: numbers }))
    setDisplayValues(prev => ({ ...prev, [field]: formatCurrencyInput(value) }))
  }

  const { validateFormData, sanitizeNumeric } = useSecureForm()

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

    // Server-side validation and sanitization of critical fields
    const { isValid, sanitizedData, errors } = await validateFormData({
      email: formData.email,
      phone: formData.phone,
      business_name: formData.businessName,
      business_address: formData.businessAddress,
      notes: formData.notes || '',
      call_notes: formData.callNotes || '',
      credit_score: formData.creditScore || ''
    })

    if (!isValid) {
      const errList = Object.values(errors).flat().slice(0, 4).join(', ')
      toast({
        title: "Validation Error",
        description: errList || "Please correct the highlighted fields",
        variant: "destructive"
      })
      return
    }

    // Sanitize numeric amounts
    const sanitizeNumber = async (v?: string) => {
      if (!v) return undefined
      const res = await sanitizeNumeric(String(v))
      const cleaned = res.sanitized?.replace(/[^0-9.\-]/g, '')
      const num = cleaned ? Number(cleaned) : undefined
      return Number.isFinite(num!) ? num : undefined
    }

    const annual_revenue = await sanitizeNumber(formData.annualRevenue)
    const income = await sanitizeNumber(formData.income)
    const existing_loan_amount = await sanitizeNumber(formData.existingLoanAmount)
    const net_operating_income = await sanitizeNumber(formData.netOperatingIncome)
    const property_payment_amount = await sanitizeNumber(formData.propertyPaymentAmount)
    const loan_amount = await sanitizeNumber(formData.loanAmount)
    const interest_rate = await sanitizeNumber(formData.interestRate)
    const ownership_percentage = await sanitizeNumber(formData.ownershipPercentage)
    const current_processing_rate = await sanitizeNumber(formData.currentProcessingRate)
    const monthly_processing_volume = await sanitizeNumber(formData.monthlyProcessingVolume)
    const average_transaction_size = await sanitizeNumber(formData.averageTransactionSize)
    const credit_score = sanitizedData.credit_score ? Number(sanitizedData.credit_score) : undefined

    try {
      // Create contact entity with sanitized fields
      const contactData = {
        // Personal fields
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: sanitizedData.email,
        personal_email: formData.personalEmail?.trim() || null,
        phone: sanitizedData.phone || null,
        mobile_phone: formData.mobilePhone?.trim() || null,
        home_address: formData.homeAddress?.trim() || null,
        home_city: formData.homeCity?.trim() || null,
        home_state: formData.homeState?.trim() || null,
        home_zip_code: formData.homeZipCode?.trim() || null,
        
        // Business fields
        business_name: sanitizedData.business_name || formData.businessName?.trim() || null,
        business_address: sanitizedData.business_address || formData.businessAddress?.trim() || null,
        business_city: formData.businessCity?.trim() || null,
        business_state: formData.businessState?.trim() || null,
        business_zip_code: formData.businessZipCode?.trim() || null,
        year_established: formData.yearEstablished ? Number(formData.yearEstablished) : undefined,
        naics_code: formData.naicsCode?.trim() || null,
        ownership_structure: formData.ownershipStructure?.trim() || null,
        ownership_percentage,
        
        // Financial fields
        annual_revenue,
        income,
        credit_score,
        existing_loan_amount,
        net_operating_income,
        property_payment_amount,
        owns_property: !!formData.ownsProperty,
        
        // Loan fields
        loan_amount,
        loan_type: formData.loanType || null,
        interest_rate,
        
        // Merchant processing
        pos_system: formData.posSystem || null,
        processor_name: formData.processorName || null,
        current_processing_rate,
        monthly_processing_volume,
        average_transaction_size,
        
        // Banking & BDO
        bdo_name: formData.bdoName || null,
        bdo_telephone: formData.bdoTelephone || null,
        bdo_email: formData.bdoEmail || null,
        bank_lender_name: formData.bankLenderName || null,
        
        // Lead management
        priority: formData.priority.toLowerCase(),
        stage: formData.stage,
        notes: sanitizedData.notes || null,
        call_notes: sanitizedData.call_notes || null,
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
            business_name: sanitizedData.business_name || formData.businessName,
            email: sanitizedData.email,
            phone: sanitizedData.phone
          }
        })

      toast({
        title: "Lead Created",
        description: "New lead has been added to your pipeline",
      })

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
    <StandardPageLayout>
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground no-underline">Create New Lead</h1>
            <p className="text-sm text-muted-foreground">Add a new lead to your SBA & Commercial Loan pipeline</p>
          </div>
          <Button 
            onClick={() => navigate('/leads')}
          >
            Back to Leads
          </Button>
        </div>
        
        {/* Row 1: Personal, Financial, and Business Information */}
        <div className="grid gap-6 md:grid-cols-3">
          <StandardContentCard title="Personal Information" className="border border-blue-600">
              <p className="text-sm text-muted-foreground mb-4">
                Basic borrower details and contact information
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter first name"
                      className="border-[#0A1628]"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter last name"
                      className="border-[#0A1628]"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter email address"
                    className="border-[#0A1628]"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="(555) 123-4567"
                      className="border-[#0A1628]"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobilePhone">Mobile Phone</Label>
                    <Input 
                      id="mobilePhone" 
                      placeholder="(555) 987-6543"
                      className="border-[#0A1628]"
                      value={formData.mobilePhone}
                      onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalEmail">Personal Email</Label>
                  <Input 
                    id="personalEmail" 
                    type="email" 
                    placeholder="Personal email address"
                    className="border-[#0A1628]"
                    value={formData.personalEmail}
                    onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeAddress">Home Address</Label>
                  <Input 
                    id="homeAddress" 
                    placeholder="123 Main St"
                    className="border-[#0A1628]"
                    value={formData.homeAddress}
                    onChange={(e) => handleInputChange("homeAddress", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeCity">City</Label>
                    <Input 
                      id="homeCity" 
                      placeholder="City"
                      value={formData.homeCity}
                      onChange={(e) => handleInputChange("homeCity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeState">State</Label>
                    <Input 
                      id="homeState" 
                      placeholder="State"
                      value={formData.homeState}
                      onChange={(e) => handleInputChange("homeState", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeZipCode">Zip Code</Label>
                    <Input 
                      id="homeZipCode" 
                      placeholder="ZIP"
                      value={formData.homeZipCode}
                      onChange={(e) => handleInputChange("homeZipCode", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Financial Information" className="border border-blue-600">
              <p className="text-sm text-muted-foreground mb-4">
                Income, employment, and financial details
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income">Annual Income</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        id="income" 
                        type="text"
                        placeholder="75,000"
                        value={displayValues.income}
                        onChange={(e) => handleCurrencyChange("income", e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualRevenue">Annual Revenue</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        id="annualRevenue" 
                        type="text"
                        placeholder="500,000"
                        value={displayValues.annualRevenue}
                        onChange={(e) => handleCurrencyChange("annualRevenue", e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditScore">Credit Score</Label>
                    <Input 
                      id="creditScore" 
                      type="number"
                      placeholder="750"
                      value={formData.creditScore}
                      onChange={(e) => handleInputChange("creditScore", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="existingLoanAmount">Existing Loan Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        id="existingLoanAmount" 
                        type="text"
                        placeholder="50,000"
                        value={displayValues.existingLoanAmount}
                        onChange={(e) => handleCurrencyChange("existingLoanAmount", e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="netOperatingIncome">Net Operating Income</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        id="netOperatingIncome" 
                        type="text"
                        placeholder="100,000"
                        value={displayValues.netOperatingIncome}
                        onChange={(e) => handleCurrencyChange("netOperatingIncome", e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyPaymentAmount">Property Payment</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        id="propertyPaymentAmount" 
                        type="text"
                        placeholder="2,500"
                        value={displayValues.propertyPaymentAmount}
                        onChange={(e) => handleCurrencyChange("propertyPaymentAmount", e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ownsProperty"
                    checked={formData.ownsProperty}
                    onChange={(e) => handleInputChange("ownsProperty", e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="ownsProperty" className="font-normal cursor-pointer">
                    Owns Property
                  </Label>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Business Information" className="border border-blue-600">
              <p className="text-sm text-muted-foreground mb-4">
                Details about the borrower's business
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    placeholder="Enter business name"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input 
                    id="businessAddress" 
                    placeholder="Enter business address"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessCity">City</Label>
                    <Input 
                      id="businessCity" 
                      placeholder="City"
                      value={formData.businessCity}
                      onChange={(e) => handleInputChange("businessCity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessState">State</Label>
                    <Input 
                      id="businessState" 
                      placeholder="State"
                      value={formData.businessState}
                      onChange={(e) => handleInputChange("businessState", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessZipCode">Zip Code</Label>
                    <Input 
                      id="businessZipCode" 
                      placeholder="ZIP"
                      value={formData.businessZipCode}
                      onChange={(e) => handleInputChange("businessZipCode", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearEstablished">Year</Label>
                    <Input 
                      id="yearEstablished" 
                      type="number"
                      placeholder="YYYY"
                      min="1950"
                      max="2100"
                      value={formData.yearEstablished}
                      onChange={(e) => handleInputChange("yearEstablished", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="naicsCode">NAICS Code</Label>
                    <Input 
                      id="naicsCode" 
                      placeholder="Enter NAICS code"
                      value={formData.naicsCode}
                      onChange={(e) => handleInputChange("naicsCode", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownershipStructure">Ownership Structure</Label>
                    <Select value={formData.ownershipStructure} onValueChange={(value) => handleInputChange("ownershipStructure", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select structure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="LLC">LLC</SelectItem>
                        <SelectItem value="Corporation">Corporation</SelectItem>
                        <SelectItem value="S-Corp">S-Corp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownershipPercentage">Ownership %</Label>
                    <Input 
                      id="ownershipPercentage" 
                      type="number"
                      placeholder="100"
                      value={formData.ownershipPercentage}
                      onChange={(e) => handleInputChange("ownershipPercentage", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </StandardContentCard>
          </div>

          {/* Row 2: Loan, Merchant Processing, and Banking/BDO Information */}
          <div className="grid gap-6 md:grid-cols-3">
            <StandardContentCard title="Loan Information" className="border border-blue-600">
              <p className="text-sm text-muted-foreground mb-4">
                Loan requirements and financial details
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount</Label>
                    <Input 
                      id="loanAmount" 
                      type="number"
                      placeholder="$250,000"
                      value={formData.loanAmount}
                      onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanType">Loan Type</Label>
                    <Select value={formData.loanType} onValueChange={(value) => handleInputChange("loanType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOAN_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input 
                    id="interestRate" 
                    type="number"
                    step="0.01"
                    placeholder="5.5"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange("interestRate", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Loan Stage</Label>
                    <Select value={formData.stage} onValueChange={(value) => handleInputChange("stage", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.filter(stage => stage !== "All").map((stage) => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.filter(priority => priority !== "All").map((priority) => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Merchant Processing" className="border border-blue-600">
              <p className="text-sm text-muted-foreground mb-4">
                Point of sale and processing information
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="posSystem">POS System</Label>
                  <Input 
                    id="posSystem" 
                    placeholder="e.g., Square, Clover"
                    value={formData.posSystem}
                    onChange={(e) => handleInputChange("posSystem", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processorName">Processor Name</Label>
                  <Input 
                    id="processorName" 
                    placeholder="Payment processor"
                    value={formData.processorName}
                    onChange={(e) => handleInputChange("processorName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentProcessingRate">Current Processing Rate (%)</Label>
                  <Input 
                    id="currentProcessingRate" 
                    type="number"
                    step="0.01"
                    placeholder="2.9"
                    value={formData.currentProcessingRate}
                    onChange={(e) => handleInputChange("currentProcessingRate", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyProcessingVolume">Monthly Volume</Label>
                    <Input 
                      id="monthlyProcessingVolume" 
                      type="number"
                      placeholder="$50,000"
                      value={formData.monthlyProcessingVolume}
                      onChange={(e) => handleInputChange("monthlyProcessingVolume", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="averageTransactionSize">Avg Transaction</Label>
                    <Input 
                      id="averageTransactionSize" 
                      type="number"
                      placeholder="$75"
                      value={formData.averageTransactionSize}
                      onChange={(e) => handleInputChange("averageTransactionSize", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Banking & BDO Information" className="border border-blue-600">
              <p className="text-sm text-muted-foreground mb-4">
                Banking relationship and business development officer details
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankLenderName">Bank / Lender Name</Label>
                  <Input 
                    id="bankLenderName" 
                    placeholder="Enter bank name"
                    value={formData.bankLenderName}
                    onChange={(e) => handleInputChange("bankLenderName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bdoName">BDO Name</Label>
                  <Input 
                    id="bdoName" 
                    placeholder="Business development officer"
                    value={formData.bdoName}
                    onChange={(e) => handleInputChange("bdoName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bdoTelephone">BDO Telephone</Label>
                    <Input 
                      id="bdoTelephone" 
                      placeholder="(555) 123-4567"
                      value={formData.bdoTelephone}
                      onChange={(e) => handleInputChange("bdoTelephone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bdoEmail">BDO Email</Label>
                    <Input 
                      id="bdoEmail" 
                      type="email"
                      placeholder="bdo@bank.com"
                      value={formData.bdoEmail}
                      onChange={(e) => handleInputChange("bdoEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </StandardContentCard>
          </div>

          {/* Row 4: Notes Section - Full Width */}
          <StandardContentCard title="Additional Notes" className="border border-blue-600">
            <p className="text-sm text-muted-foreground mb-4">
              Any additional information or comments
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">General Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Enter any additional notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="callNotes">Call Notes</Label>
                <Textarea 
                  id="callNotes" 
                  placeholder="Notes from phone conversations"
                  value={formData.callNotes}
                  onChange={(e) => handleInputChange("callNotes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </StandardContentCard>

          {/* Actions */}
          <div className="flex gap-4 justify-end pb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/leads')}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="px-8"
            >
              Create Lead
            </Button>
          </div>
        </div>
    </StandardPageLayout>
  )
}
