import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IBMPageHeader } from "@/components/ui/IBMPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { User, Briefcase, Phone, Mail, FileText, Star } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewLenderContact() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { id: lenderId } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lenderName, setLenderName] = useState<string>("")
  
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    mobile_phone: "",
    notes: "",
    is_primary: false,
    is_bdo: false,
    is_closer: false,
    is_vice_president: false,
    is_active: true
  })

  // Fetch lender name for display
  useEffect(() => {
    const fetchLender = async () => {
      if (!lenderId) return
      
      const { data, error } = await supabase
        .from('lenders')
        .select('name')
        .eq('id', lenderId)
        .single()
      
      if (!error && data) {
        setLenderName(data.name)
      }
    }
    
    fetchLender()
  }, [lenderId])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a contact",
        variant: "destructive"
      })
      return
    }

    if (!lenderId) {
      toast({
        title: "Error",
        description: "Lender ID is required",
        variant: "destructive"
      })
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact name is required",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('lender_contacts').insert([{
        lender_id: lenderId,
        name: formData.name.trim(),
        title: formData.title.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        mobile_phone: formData.mobile_phone.trim() || null,
        notes: formData.notes.trim() || null,
        is_primary: formData.is_primary,
        is_bdo: formData.is_bdo,
        is_closer: formData.is_closer,
        is_vice_president: formData.is_vice_president,
        is_active: formData.is_active,
        user_id: user.id,
      }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Contact added successfully"
      })
      
      navigate(`/lenders/${lenderId}`)
    } catch (error: any) {
      console.error('Error creating contact:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create contact",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <IBMPageHeader
        title="Add New Contact"
        subtitle={lenderName ? `Add a contact for ${lenderName}` : "Add a new lender contact"}
      />

      <div className="p-8">
        <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
          {/* Basic Information */}
          <StandardContentCard
            title={
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span>Basic Information</span>
              </div>
            }
            className="border-l-4 border-l-primary"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Title / Position
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Business Development Officer, Loan Officer, etc."
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                  Active Contact
                </Label>
              </div>
            </div>
          </StandardContentCard>

          <Separator />

          {/* Contact Information */}
          <StandardContentCard
            title={
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>Contact Information</span>
              </div>
            }
            className="border-l-4 border-l-primary"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Office Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Mobile Phone
                </Label>
                <Input
                  id="mobile_phone"
                  type="tel"
                  value={formData.mobile_phone}
                  onChange={(e) => handleInputChange("mobile_phone", e.target.value)}
                  placeholder="(555) 987-6543"
                  className="h-11"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@lender.com"
                  className="h-11"
                />
              </div>
            </div>
          </StandardContentCard>

          <Separator />

          {/* Role & Responsibilities */}
          <StandardContentCard
            title={
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span>Role & Responsibilities</span>
              </div>
            }
            className="border-l-4 border-l-primary"
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select all roles that apply to this contact
              </p>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => handleInputChange("is_primary", checked as boolean)}
                />
                <Label htmlFor="is_primary" className="text-sm font-medium cursor-pointer">
                  Primary Contact
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_bdo"
                  checked={formData.is_bdo}
                  onCheckedChange={(checked) => handleInputChange("is_bdo", checked as boolean)}
                />
                <Label htmlFor="is_bdo" className="text-sm font-medium cursor-pointer">
                  Business Development Officer (BDO)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_closer"
                  checked={formData.is_closer}
                  onCheckedChange={(checked) => handleInputChange("is_closer", checked as boolean)}
                />
                <Label htmlFor="is_closer" className="text-sm font-medium cursor-pointer">
                  Loan Closer
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_vice_president"
                  checked={formData.is_vice_president}
                  onCheckedChange={(checked) => handleInputChange("is_vice_president", checked as boolean)}
                />
                <Label htmlFor="is_vice_president" className="text-sm font-medium cursor-pointer">
                  Vice President
                </Label>
              </div>
            </div>
          </StandardContentCard>

          <Separator />

          {/* Additional Details */}
          <StandardContentCard
            title={
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Additional Details</span>
              </div>
            }
            className="border-l-4 border-l-primary"
          >
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any additional information about this contact..."
                rows={5}
                className="resize-none"
              />
            </div>
          </StandardContentCard>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/lenders/${lenderId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
