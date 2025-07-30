import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Mic, 
  Zap, 
  BarChart3, 
  FileText, 
  Bot,
  Workflow,
  TrendingUp,
  Cpu,
  Settings,
  Shield
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { AIDocumentAnalyzer } from "./ai/AIDocumentAnalyzer"
import { VoiceAIIntegration } from "./ai/VoiceAIIntegration"
import { WorkflowAutomation } from "./ai/WorkflowAutomation"
import { PredictiveAnalytics } from "./ai/PredictiveAnalytics"

export function AdminAITools() {
  const { hasRole } = useAuth()
  
  if (!hasRole('admin')) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground">
            These advanced AI tools are only available to administrators.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Cpu className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold dark:text-white">AI & Automation Tools</h2>
          <p className="text-muted-foreground dark:text-white">Advanced tools to boost loan origination efficiency</p>
        </div>
        <Badge variant="default" className="ml-auto">Admin Only</Badge>
      </div>

      <Tabs defaultValue="ai-assistant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-assistant" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="voice-ai" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice AI
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assistant">
          <AIDocumentAnalyzer />
        </TabsContent>

        <TabsContent value="voice-ai">
          <VoiceAIIntegration />
        </TabsContent>

        <TabsContent value="automation">
          <WorkflowAutomation />
        </TabsContent>

        <TabsContent value="analytics">
          <PredictiveAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}