import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Badge component removed - using plain text instead
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Copy, ExternalLink, Code, Database, Lock, Zap, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function APIDocs() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const apiEndpoints = [
    {
      id: "leads",
      method: "GET",
      endpoint: "/api/leads",
      description: "Retrieve all leads with optional filtering",
      category: "Leads",
      authentication: "Required",
      parameters: [
        { name: "stage", type: "string", required: false, description: "Filter by lead stage" },
        { name: "priority", type: "string", required: false, description: "Filter by priority level" },
        { name: "limit", type: "number", required: false, description: "Limit number of results" }
      ],
      example: `{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "stage": "New",
      "priority": "high",
      "loan_amount": 100000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}`
    },
    {
      id: "create-lead",
      method: "POST",
      endpoint: "/api/leads",
      description: "Create a new lead record",
      category: "Leads",
      authentication: "Required",
      parameters: [
        { name: "name", type: "string", required: true, description: "Lead's full name" },
        { name: "email", type: "string", required: true, description: "Lead's email address" },
        { name: "phone", type: "string", required: false, description: "Lead's phone number" },
        { name: "loan_amount", type: "number", required: false, description: "Requested loan amount" }
      ],
      example: `{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "loan_amount": 150000,
  "stage": "New",
  "priority": "medium"
}`
    },
    {
      id: "clients",
      method: "GET", 
      endpoint: "/api/clients",
      description: "Retrieve all client records",
      category: "Clients",
      authentication: "Required",
      parameters: [
        { name: "status", type: "string", required: false, description: "Filter by client status" },
        { name: "limit", type: "number", required: false, description: "Limit number of results" }
      ],
      example: `{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "Active",
      "total_loans": 2,
      "total_loan_value": 250000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}`
    },
    {
      id: "pipeline",
      method: "GET",
      endpoint: "/api/pipeline",
      description: "Get pipeline data with stage information",
      category: "Pipeline",
      authentication: "Required",
      parameters: [
        { name: "stage", type: "string", required: false, description: "Filter by pipeline stage" },
        { name: "date_from", type: "string", required: false, description: "Start date (ISO 8601)" },
        { name: "date_to", type: "string", required: false, description: "End date (ISO 8601)" }
      ],
      example: `{
  "stages": [
    {
      "name": "New",
      "count": 15,
      "total_value": 1500000
    },
    {
      "name": "Loan Application Signed",
      "count": 8,
      "total_value": 800000
    }
  ],
  "total_value": 2300000
}`
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Code example has been copied to your clipboard",
    })
  }

  const filteredEndpoints = apiEndpoints.filter(endpoint =>
    endpoint.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [...new Set(apiEndpoints.map(ep => ep.category))]

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-2 mb-6">
          <Code className="h-6 w-6" />
          <h1 className="text-3xl font-bold">API Command Center</h1>
          <p className="text-muted-foreground ml-4">
            Complete API reference and integration documentation
          </p>
        </div>

        {/* API Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Endpoints</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className="w-5 h-5" />
                    <p className="text-lg font-bold">{apiEndpoints.length}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  ACTIVE
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-primary">{categories.length}</p>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Authentication</p>
                  <p className="text-2xl font-bold text-primary">Secure</p>
                </div>
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Examples</p>
                  <p className="text-2xl font-bold text-primary">Available</p>
                </div>
                <Code className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoints..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm rounded-2xl p-1">
              <TabsTrigger value="overview" className="rounded-xl">
                <Database className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="authentication" className="rounded-xl">
                <Lock className="w-4 h-4 mr-2" />
                Authentication
              </TabsTrigger>
              <TabsTrigger value="endpoints" className="rounded-xl">
                <Zap className="w-4 h-4 mr-2" />
                Endpoints
              </TabsTrigger>
              <TabsTrigger value="examples" className="rounded-xl">
                <Code className="w-4 h-4 mr-2" />
                Examples
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Welcome to the LoanFlow CRM API. This RESTful API allows you to integrate your applications with our CRM system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-medium mb-2">Base URL</h3>
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        https://gshxxsniwytjgcnthyfq.supabase.co/rest/v1
                      </code>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-medium mb-2">Content Type</h3>
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        application/json
                      </code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Available Resources</h3>
                    <div className="grid md:grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <span key={category} className="text-sm font-medium">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>API Authentication</CardTitle>
                  <CardDescription>
                    All API requests require authentication using an API key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h3 className="font-medium mb-2">Authorization Header</h3>
                    <div className="bg-background p-3 rounded border font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY")}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>

                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <h3 className="font-medium text-destructive mb-2">Important</h3>
                    <p className="text-sm text-destructive/80">
                      Keep your API key secure and never expose it in client-side code. 
                      All API requests must be made from your server.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <div className="grid gap-6">
                {filteredEndpoints.map((endpoint) => (
                  <Card key={endpoint.id} className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium">
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono">{endpoint.endpoint}</code>
                        </div>
                        <span className="text-sm font-medium">{endpoint.category}</span>
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono">{param.name}</code>
                                <span className="text-xs font-medium">
                                  {param.type}
                                </span>
                                {param.required && (
                                  <span className="text-xs font-medium">
                                    Required
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Response Example</h4>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(endpoint.example)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <pre className="bg-background p-3 rounded border text-sm overflow-x-auto">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEndpoints.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No endpoints found</h3>
                  <p className="text-foreground/70">Try adjusting your search criteria</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>
                    Sample implementations in different programming languages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">JavaScript (Node.js)</h3>
                    <div className="bg-background p-4 rounded border">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://gshxxsniwytjgcnthyfq.supabase.co/rest/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Get all leads
const getLeads = async () => {
  try {
    const response = await api.get('/leads');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Create a new lead
const createLead = async (leadData) => {
  try {
    const response = await api.post('/leads', leadData);
    console.log('Lead created:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};`}</code>
                      </pre>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => copyToClipboard(`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://gshxxsniwytjgcnthyfq.supabase.co/rest/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Get all leads
const getLeads = async () => {
  try {
    const response = await api.get('/leads');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Create a new lead
const createLead = async (leadData) => {
  try {
    const response = await api.post('/leads', leadData);
    console.log('Lead created:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};`)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Code
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Python</h3>
                    <div className="bg-background p-4 rounded border">
                      <pre className="text-sm overflow-x-auto">
                        <code>{`import requests
import json

class LoanFlowAPI:
    def __init__(self, api_key):
        self.base_url = 'https://gshxxsniwytjgcnthyfq.supabase.co/rest/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_leads(self, **params):
        response = requests.get(
            f'{self.base_url}/leads',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def create_lead(self, lead_data):
        response = requests.post(
            f'{self.base_url}/leads',
            headers=self.headers,
            json=lead_data
        )
        return response.json()

# Usage
api = LoanFlowAPI('YOUR_API_KEY')
leads = api.get_leads(stage='New', limit=10)`}</code>
                      </pre>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => copyToClipboard(`import requests
import json

class LoanFlowAPI:
    def __init__(self, api_key):
        self.base_url = 'https://gshxxsniwytjgcnthyfq.supabase.co/rest/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_leads(self, **params):
        response = requests.get(
            f'{self.base_url}/leads',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def create_lead(self, lead_data):
        response = requests.post(
            f'{self.base_url}/leads',
            headers=self.headers,
            json=lead_data
        )
        return response.json()

# Usage
api = LoanFlowAPI('YOUR_API_KEY')
leads = api.get_leads(stage='New', limit=10)`)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Code
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>External Resources</CardTitle>
                  <CardDescription>
                    Additional documentation and tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('https://docs.lovable.dev/', '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Lovable Platform Documentation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('https://supabase.com/docs', '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Supabase Database Documentation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('https://restfulapi.net/', '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    REST API Best Practices
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </>
  )
}