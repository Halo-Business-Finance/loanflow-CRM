import React, { useState } from "react";
import HybridLayout from "@/components/HybridLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  FileText, 
  Video, 
  Globe,
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Settings,
  Users,
  Target,
  GraduationCap,
  HelpCircle,
  Search
} from "lucide-react";

interface ResourceOverview {
  totalResources: number;
  documentationScore: number;
  trainingCompleted: number;
  supportTickets: number;
  knowledgeBaseArticles: number;
  videoTutorials: number;
  userGuides: number;
  complianceDocuments: number;
}

export default function Resources() {
  const [overview] = useState<ResourceOverview>({
    totalResources: 147,
    documentationScore: 94,
    trainingCompleted: 87,
    supportTickets: 3,
    knowledgeBaseArticles: 42,
    videoTutorials: 18,
    userGuides: 25,
    complianceDocuments: 12
  });

  const documentationItems = [
    { name: "User Manual", type: "PDF", category: "Core", url: "https://docs.lovable.dev/", status: "Updated" },
    { name: "API Documentation", type: "Web", category: "Technical", url: "https://supabase.com/docs", status: "Current" },
    { name: "Best Practices Guide", type: "PDF", category: "Training", url: "https://docs.lovable.dev/tips-tricks/troubleshooting", status: "Updated" },
    { name: "Security Protocols", type: "PDF", category: "Compliance", url: "https://docs.lovable.dev/", status: "Critical" },
    { name: "Integration Handbook", type: "PDF", category: "Technical", url: "https://supabase.com/docs", status: "Updated" }
  ];

  const trainingMaterials = [
    { name: "Getting Started Tutorial", type: "Video", duration: "15 min", url: "https://www.youtube.com/watch?v=9KHLTZaJcR8", completion: "100%" },
    { name: "Advanced Features Training", type: "Video", duration: "45 min", url: "https://www.youtube.com/playlist?list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO", completion: "87%" },
    { name: "CRM Workflow Guide", type: "Interactive", duration: "30 min", url: "https://docs.lovable.dev/user-guides/quickstart", completion: "92%" },
    { name: "Security Best Practices", type: "Video", duration: "25 min", url: "https://docs.lovable.dev/", completion: "78%" },
    { name: "Compliance Training", type: "Course", duration: "2 hours", url: "https://docs.lovable.dev/", completion: "65%" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'destructive';
      case 'Updated': return 'default';
      case 'Current': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return Download;
      case 'Video': return Video;
      case 'Web': return ExternalLink;
      case 'Interactive': return Target;
      case 'Course': return GraduationCap;
      default: return FileText;
    }
  };

  return (
    <HybridLayout>
      <div className="h-full flex flex-col space-y-6 p-6">
        <div className="bg-white px-6 py-4 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#0f62fe]" />
            <h1 className="text-xl font-normal text-[#161616]">Resource Management Center</h1>
          </div>
        </div>

        {/* Resource Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">{overview.totalResources}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Documentation Score</p>
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-primary">{overview.documentationScore}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Training Completed</p>
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-primary">{overview.trainingCompleted}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Support Tickets</p>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-primary">{overview.supportTickets}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {overview.supportTickets > 0 && (
            <Alert className="border-l-4 border-l-secondary">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {overview.supportTickets} open support ticket(s) requiring attention.
              </AlertDescription>
            </Alert>
          )}

          {overview.trainingCompleted < 90 && (
            <Alert className="border-l-4 border-l-primary">
              <GraduationCap className="h-4 w-4" />
              <AlertDescription>
                Training completion is at {overview.trainingCompleted}%. Consider completing remaining courses.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Resource Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="documentation" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <FileText className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <GraduationCap className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <HelpCircle className="h-4 w-4" />
              Support
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Settings className="h-4 w-4" />
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Resource Actions</CardTitle>
                  <CardDescription>
                    Immediate access to essential resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="ghost" onClick={() => window.open('https://docs.lovable.dev/', '_blank')}>
                    <Search className="w-4 h-4 mr-2" />
                    Search Knowledge Base
                  </Button>
                  <Button className="w-full justify-start" variant="ghost" onClick={() => window.open('https://www.youtube.com/playlist?list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO', '_blank')}>
                    <Video className="w-4 h-4 mr-2" />
                    Watch Video Tutorials
                  </Button>
                  <Button className="w-full justify-start" variant="ghost" onClick={() => window.open('https://docs.lovable.dev/user-guides/quickstart', '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download User Guides
                  </Button>
                  <Button className="w-full justify-start" variant="ghost" onClick={() => window.open('https://discord.com/channels/1119885301872070706/1280461670979993613', '_blank')}>
                    <Users className="w-4 h-4 mr-2" />
                    Community Support
                  </Button>
                </CardContent>
              </Card>

              {/* Resource Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource System Health</CardTitle>
                  <CardDescription>
                    Real-time status of resource components
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Knowledge Base</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Video Platform</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Available</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Support Portal</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Community Forum</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Download Center</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Accessible</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Resource Activity</CardTitle>
                <CardDescription>
                  Latest updates and resource interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New documentation published</p>
                      <p className="text-xs text-muted-foreground truncate">API Integration Guide v2.1 • 2 hours ago</p>
                    </div>
                    <Badge variant="default" className="flex-shrink-0">New</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
                    <Video className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Training module completed</p>
                      <p className="text-xs text-muted-foreground truncate">Advanced Security Features • 5 hours ago</p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
                    <Download className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Resource downloaded</p>
                      <p className="text-xs text-muted-foreground truncate">Compliance Checklist Template • 1 day ago</p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">Downloaded</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentation Library</CardTitle>
                <CardDescription>
                  Comprehensive documentation and reference materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentationItems.map((item, index) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <TypeIcon className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.type} • {item.category}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open(item.url, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Training & Development</CardTitle>
                <CardDescription>
                  Learning materials and progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingMaterials.map((item, index) => {
                    const TypeIcon = getTypeIcon(item.type);
                    const completion = parseInt(item.completion);
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <TypeIcon className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant={completion === 100 ? 'default' : 'secondary'}>
                              {item.completion} Complete
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.type} • {item.duration}
                          </p>
                          <div className="w-full bg-secondary/20 rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => window.open(item.url, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Support & Help</CardTitle>
                <CardDescription>
                  Get assistance and connect with support resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Contact Support</h4>
                    <Button className="w-full justify-start" onClick={() => window.open('https://docs.lovable.dev/tips-tricks/troubleshooting', '_blank')}>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Submit Support Ticket
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://discord.com/channels/1119885301872070706/1280461670979993613', '_blank')}>
                      <Users className="w-4 h-4 mr-2" />
                      Community Forum
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Self-Service</h4>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://docs.lovable.dev/', '_blank')}>
                      <Search className="w-4 h-4 mr-2" />
                      Search FAQ
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://docs.lovable.dev/tips-tricks/troubleshooting', '_blank')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Troubleshooting Guide
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Management Tools</CardTitle>
                <CardDescription>
                  Advanced tools for managing and organizing resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col" onClick={() => window.open('https://docs.lovable.dev/', '_blank')}>
                    <Download className="w-6 h-6 mb-2" />
                    <span>Bulk Download</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => window.open('https://docs.lovable.dev/', '_blank')}>
                    <Search className="w-6 h-6 mb-2" />
                    <span>Advanced Search</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => window.open('https://docs.lovable.dev/', '_blank')}>
                    <Settings className="w-6 h-6 mb-2" />
                    <span>Preferences</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HybridLayout>
  );
}