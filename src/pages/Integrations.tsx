import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar, 
  CreditCard, 
  FileText, 
  Zap, 
  BarChart3,
  Users,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Bot,
  Target,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Star,
  Sparkles,
  ArrowRight,
  Shield,
  Workflow,
  FileImage
} from "lucide-react"

const integrations = [
  {
    id: "email",
    name: "Email Marketing",
    description: "Connect with Mailchimp, HubSpot, or custom SMTP",
    icon: Mail,
    category: "communication",
    status: "available",
    features: ["Drip campaigns", "Email templates", "Open tracking", "Click tracking"]
  },
  {
    id: "sms",
    name: "SMS Integration",
    description: "Two-way SMS messaging with clients",
    icon: MessageSquare,
    category: "communication", 
    status: "available",
    features: ["Bulk SMS", "Two-way messaging", "SMS templates", "Delivery reports"]
  },
  {
    id: "calendar",
    name: "Calendar Sync",
    description: "Sync with Google Calendar, Outlook, and more",
    icon: Calendar,
    category: "productivity",
    status: "connected",
    features: ["Two-way sync", "Meeting scheduling", "Availability", "Reminders"]
  },
  {
    id: "accounting",
    name: "Accounting Software",
    description: "Connect with QuickBooks, Xero, FreshBooks",
    icon: CreditCard,
    category: "finance",
    status: "available",
    features: ["Invoice sync", "Payment tracking", "Expense management", "Reports"]
  },
  {
    id: "esignature",
    name: "E-Signature",
    description: "DocuSign, HelloSign integration",
    icon: FileText,
    category: "documents",
    status: "available",
    features: ["Document signing", "Templates", "Audit trail", "Reminders"]
  },
  {
    id: "adobe-pdf",
    name: "Adobe PDF Embed",
    description: "Advanced PDF viewing and document management with Adobe services",
    icon: FileImage,
    category: "documents",
    status: "connected",
    features: ["PDF viewer", "Document embedding", "Annotation tools", "Professional viewing"]
  },
  {
    id: "zapier",
    name: "Zapier Automation",
    description: "Connect with 5000+ apps via Zapier",
    icon: Zap,
    category: "automation",
    status: "connected",
    features: ["Automated workflows", "Data sync", "Triggers", "Multi-step zaps"]
  }
]

const aiTools = [
  {
    id: "lead-scoring",
    name: "AI Lead Scoring",
    description: "Automatically score and prioritize leads",
    icon: Target,
    status: "active",
    features: ["Behavioral scoring", "Demographic analysis", "Engagement tracking", "Priority ranking"]
  },
  {
    id: "forecasting",
    name: "Revenue Forecasting",
    description: "Predict revenue based on pipeline data",
    icon: TrendingUp,
    status: "active", 
    features: ["Pipeline analysis", "Seasonal trends", "Confidence intervals", "Goal tracking"]
  },
  {
    id: "automation",
    name: "Workflow Automation",
    description: "Automate repetitive tasks and follow-ups",
    icon: Bot,
    status: "active",
    features: ["Task automation", "Email sequences", "Stage transitions", "Reminders"]
  },
  {
    id: "analytics",
    name: "Predictive Analytics",
    description: "AI-powered insights and recommendations",
    icon: BarChart3,
    status: "available",
    features: ["Performance insights", "Trend analysis", "Recommendations", "Custom reports"]
  }
]

export default function Integrations() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("integrations")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [emailSettings, setEmailSettings] = useState({
    provider: "",
    apiKey: "",
    enabled: false
  })
  const [adobeConfig, setAdobeConfig] = useState({
    clientId: "",
    isDemo: true
  })
  const [showAdobeConfig, setShowAdobeConfig] = useState(false)
  const { toast } = useToast()

  // Fetch Adobe configuration on component mount
  useEffect(() => {
    fetchAdobeConfig()
  }, [])

  const fetchAdobeConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-adobe-config')
      if (error) throw error
      if (data) {
        setAdobeConfig(data)
      }
    } catch (error) {
      console.error('Error fetching Adobe config:', error)
    }
  }

  const handleBrowseMarketplace = () => {
    // Open the integrations marketplace in a new tab
    window.open('https://zapier.com/apps', '_blank')
    toast({
      title: "Opening Integration Marketplace",
      description: "Browse thousands of available integrations",
    })
  }

  const handleWebhookSave = () => {
    if (webhookUrl) {
      toast({
        title: "Webhook URL Saved",
        description: "Zapier integration configured successfully",
      })
    }
  }

  const handleIntegrationToggle = (integrationId: string, enabled: boolean) => {
    if (integrationId === "adobe-pdf") {
      setShowAdobeConfig(true)
      return
    }
    
    toast({
      title: enabled ? "Integration Enabled" : "Integration Disabled",
      description: `${integrations.find(i => i.id === integrationId)?.name} has been ${enabled ? 'enabled' : 'disabled'}`,
    })
  }

  const handleIntegrationConfigure = (integrationId: string) => {
    if (integrationId === "adobe-pdf") {
      setShowAdobeConfig(true)
      return
    }
    
    toast({
      title: "Opening Configuration",
      description: `Configure ${integrations.find(i => i.id === integrationId)?.name} settings`,
    })
  }

  const handleAIToolToggle = (toolId: string, enabled: boolean) => {
    const tool = aiTools.find(t => t.id === toolId)
    if (!tool) return

    toast({
      title: enabled ? "AI Tool Enabled" : "AI Tool Disabled",
      description: `${tool.name} has been ${enabled ? 'enabled' : 'disabled'}`,
    })
    
    // Update the tool status in the array (in a real app, this would update the backend)
    const updatedTools = aiTools.map(t => 
      t.id === toolId ? { ...t, status: enabled ? "active" : "available" } : t
    )
    // In a real implementation, you would update state here
  }

  const handleAIToolAction = (toolId: string, status: string) => {
    const tool = aiTools.find(t => t.id === toolId)
    if (!tool) return

    if (status === "active") {
      // Navigate to AI Tools configuration page
      navigate('/ai-tools', { state: { configureToolId: toolId } })
      toast({
        title: "Opening Configuration",
        description: `Configure ${tool.name} settings`,
      })
    } else {
      // Enable the tool
      toast({
        title: "AI Tool Enabled",
        description: `${tool.name} has been enabled successfully`,
      })
    }
  }

  // Filter integrations based on search and category
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Filter AI tools based on search
  const filteredAITools = aiTools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return "bg-accent/10 text-accent border-accent/20"
      case "available":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return <CheckCircle className="w-3 h-3" />
      case "available":
        return <Clock className="w-3 h-3" />
      default:
        return <AlertCircle className="w-3 h-3" />
    }
  }

  const categoryFilters = [
    { id: "all", name: "All Categories", icon: Filter },
    { id: "communication", name: "Communication", icon: MessageSquare },
    { id: "productivity", name: "Productivity", icon: Calendar },
    { id: "finance", name: "Finance", icon: CreditCard },
    { id: "documents", name: "Documents", icon: FileText },
    { id: "automation", name: "Automation", icon: Workflow }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-6 space-y-8">
          {/* Modern Header Section */}
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 animate-fade-in">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Integrations & AI Tools
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Supercharge your CRM with powerful integrations and AI-powered automation tools
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button onClick={handleBrowseMarketplace} className="group">
                <ExternalLink className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Explore Marketplace
              </Button>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                <Shield className="w-3 h-3 mr-1" />
                Secure & Verified
              </Badge>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations and tools..."
                  className="pl-10 h-12 border-0 bg-background/80 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                {categoryFilters.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2 whitespace-nowrap rounded-xl"
                  >
                    <category.icon className="w-3 h-3" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm rounded-2xl p-1">
              <TabsTrigger value="integrations" className="rounded-xl">
                <Workflow className="w-4 h-4 mr-2" />
                Third-Party Integrations
              </TabsTrigger>
              <TabsTrigger value="ai-tools" className="rounded-xl">
                <Bot className="w-4 h-4 mr-2" />
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="rounded-xl">
                <Zap className="w-4 h-4 mr-2" />
                Webhooks & API
              </TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Connected</p>
                        <p className="text-xl font-bold text-foreground">
                          {integrations.filter(i => i.status === "connected").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Available</p>
                        <p className="text-xl font-bold text-foreground">
                          {integrations.filter(i => i.status === "available").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Filter className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Categories</p>
                        <p className="text-xl font-bold text-foreground">{categoryFilters.length - 1}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-warning/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Featured</p>
                        <p className="text-xl font-bold text-foreground">2</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredIntegrations.map((integration) => (
                  <Card 
                    key={integration.id} 
                    className="group border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <CardHeader className="pb-4 relative">
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-primary opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity" />
                      <div className="flex items-start justify-between relative">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                            {integration.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(integration.status)}
                            <Badge className={`${getStatusColor(integration.status)} border text-xs px-2 py-1 rounded-full`}>
                              {integration.status}
                            </Badge>
                          </div>
                        </div>
                        <Switch 
                          checked={integration.status === "connected"}
                          onCheckedChange={(enabled) => handleIntegrationToggle(integration.id, enabled)}
                          className="data-[state=checked]:bg-accent"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-foreground/70 leading-relaxed">
                        {integration.description}
                      </CardDescription>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground/80">Key Features</Label>
                        <div className="flex flex-wrap gap-2">
                          {integration.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs bg-muted/50 text-foreground/70 border-0 rounded-lg px-2 py-1">
                              {feature}
                            </Badge>
                          ))}
                          {integration.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-muted/50 text-foreground/70 border-0 rounded-lg px-2 py-1">
                              +{integration.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button 
                        className={`w-full group/btn rounded-xl transition-all ${
                          integration.status === "connected" 
                            ? "bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground border border-accent/20" 
                            : "bg-gradient-primary hover:shadow-lg hover:shadow-primary/20"
                        }`}
                        variant={integration.status === "connected" ? "outline" : "default"}
                        onClick={() => handleIntegrationConfigure(integration.id)}
                      >
                        {integration.status === "connected" ? (
                          <>
                            <Settings className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                            Configure
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 mr-2 group-hover/btn:translate-x-1 transition-transform" />
                            Connect Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredIntegrations.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No integrations found</h3>
                  <p className="text-foreground/70">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-tools" className="space-y-6">
              {/* AI Tools Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2 mb-4">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">AI-Powered Intelligence</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Intelligent Automation Tools</h2>
                <p className="text-foreground/70">Leverage AI to automate tasks and gain actionable insights</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {filteredAITools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="group border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <CardHeader className="pb-4 relative">
                      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
                       <div className="flex items-start justify-between relative">
                         <div className="space-y-1">
                           <CardTitle className="text-xl text-foreground group-hover:text-accent transition-colors">
                             {tool.name}
                           </CardTitle>
                           <div className="flex items-center space-x-2">
                             {getStatusIcon(tool.status)}
                             <Badge className={`${getStatusColor(tool.status)} border text-xs px-2 py-1 rounded-full`}>
                               {tool.status}
                             </Badge>
                             {tool.status === "active" && (
                               <div className="flex items-center">
                                 <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                 <span className="text-xs text-accent ml-1">Live</span>
                               </div>
                             )}
                           </div>
                         </div>
                         <Switch 
                           checked={tool.status === "active"}
                           onCheckedChange={(enabled) => handleAIToolToggle(tool.id, enabled)}
                           className="data-[state=checked]:bg-accent"
                         />
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <CardDescription className="text-foreground/70 leading-relaxed text-base">
                        {tool.description}
                      </CardDescription>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground/80">AI Capabilities</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {tool.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                              <span className="text-xs text-foreground/80">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className={`w-full group/btn rounded-xl transition-all ${
                          tool.status === "active" 
                            ? "bg-gradient-to-r from-accent/10 to-accent/5 text-accent hover:from-accent hover:to-accent/80 hover:text-accent-foreground border border-accent/20" 
                            : "bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20"
                        }`}
                        variant={tool.status === "active" ? "outline" : "default"}
                        onClick={() => handleAIToolAction(tool.id, tool.status)}
                      >
                        {tool.status === "active" ? (
                          <>
                            <Settings className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                            Configure AI
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                            Enable AI
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-foreground">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <span>Zapier Integration</span>
                    </CardTitle>
                    <CardDescription className="text-foreground/70">
                      Connect your CRM to 5000+ apps via Zapier webhooks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url" className="text-foreground/80">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="border-0 bg-background/80 rounded-xl"
                      />
                    </div>
                    <Button onClick={handleWebhookSave} className="w-full rounded-xl bg-gradient-primary">
                      <Zap className="w-4 h-4 mr-2" />
                      Save Webhook URL
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-foreground">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Settings className="w-5 h-5 text-accent" />
                      </div>
                      <span>API Configuration</span>
                    </CardTitle>
                    <CardDescription className="text-foreground/70">
                      Manage API endpoints and developer access
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-foreground/80">Active Endpoints</Label>
                      <div className="space-y-2 text-sm">
                        {[
                          { endpoint: "GET /api/leads", status: "Active" },
                          { endpoint: "POST /api/clients", status: "Active" },
                          { endpoint: "GET /api/pipeline", status: "Active" }
                        ].map((api, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border">
                            <span className="font-mono text-foreground">{api.endpoint}</span>
                            <Badge className="bg-accent/10 text-accent border-accent/20">{api.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground"
                      onClick={() => navigate('/api-docs')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      API Documentation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Adobe Configuration Dialog */}
      <Dialog open={showAdobeConfig} onOpenChange={setShowAdobeConfig}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileImage className="w-5 h-5 text-red-600" />
              Adobe PDF Configuration
            </DialogTitle>
            <DialogDescription className="text-sm">
              Current Adobe PDF Embed integration status
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Current Status */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">License</span>
                <Badge variant={adobeConfig.isDemo ? "secondary" : "default"} className="text-xs">
                  {adobeConfig.isDemo ? 'Demo' : 'Licensed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Client ID</span>
                <code className="text-xs bg-background px-1 py-0.5 rounded">
                  {adobeConfig.clientId ? `${adobeConfig.clientId.substring(0, 8)}...` : 'demo'}
                </code>
              </div>
            </div>

            {/* Quick Features */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Features Enabled</span>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>PDF Viewer</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Document Embed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Zoom Controls</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Mobile Ready</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://developer.adobe.com/document-services/docs/overview/pdf-embed-api/', '_blank')}
                className="flex-1 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Docs
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast({
                    title: "Adobe Integration Active",
                    description: "PDF viewer is ready to use.",
                  })
                  setShowAdobeConfig(false)
                }}
                className="flex-1 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}