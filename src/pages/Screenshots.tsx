import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Badge component removed - using plain text instead
import { Camera, Download, ExternalLink } from "lucide-react";
// import HybridLayout from "@/components/HybridLayout";

const Screenshots = () => {
  const pages = [
    {
      title: "Dashboard Overview",
      description: "Main dashboard with metrics, pipeline overview, and recent activity",
      url: "/",
      route: "dashboard"
    },
    {
      title: "Pipeline Management", 
      description: "Interactive sales pipeline with drag-and-drop functionality",
      url: "/pipeline",
      route: "pipeline"
    },
    {
      title: "Lead Management",
      description: "Lead cards, contact details, and management tools",
      url: "/leads", 
      route: "leads"
    },
    {
      title: "Enterprise Tools",
      description: "Advanced workflow automation and business tools",
      url: "/enterprise",
      route: "enterprise"
    }
  ];

  const takeScreenshot = async (url: string, title: string) => {
    try {
      // Open the page in a new window
      const newWindow = window.open(url, '_blank', 'width=1200,height=800');
      
      if (newWindow) {
        // Instructions for manual screenshot
        alert(`Page opened in new window. To take a screenshot:

1. Wait for page to fully load
2. Use browser screenshot:
   • Chrome: F12 → Device Toolbar → Screenshot icon
   • Firefox: F12 → Screenshot icon
   • Or use your OS screenshot tool

3. Save as "${title.toLowerCase().replace(/\s+/g, '-')}-screenshot.png"`);
      }
    } catch (error) {
      console.error('Failed to open page:', error);
    }
  };

  const openPageInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-2 mb-6">
          <Camera className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Screenshot Command Center</h1>
          <p className="text-muted-foreground ml-4">
            Capture and manage CRM system screenshots for presentations
          </p>
        </div>

        {/* Screenshot Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Pages</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Camera className="w-5 h-5" />
                    <p className="text-lg font-bold">{pages.length}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  READY
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Screenshot Tools</p>
                  <p className="text-2xl font-bold text-primary">3</p>
                </div>
                <ExternalLink className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Browser Support</p>
                  <p className="text-2xl font-bold text-primary">All</p>
                </div>
                <Download className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Export Formats</p>
                  <p className="text-2xl font-bold text-primary">PNG</p>
                </div>
                <Camera className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Take Screenshots</h2>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p><strong>Method 1:</strong> Click "Take Screenshot" → Use browser's built-in screenshot tool</p>
          <p><strong>Method 2:</strong> Click "Open Page" → Use your OS screenshot tool (Windows: Win+Shift+S, Mac: Cmd+Shift+4)</p>
          <p><strong>Method 3:</strong> Use browser extensions like "Full Page Screen Capture"</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {pages.map((page, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {page.title}
              </CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <Button 
                  onClick={() => takeScreenshot(page.url, page.title)}
                  className="w-full gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Screenshot
                </Button>
                <Button 
                  onClick={() => openPageInNewTab(page.url)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Page
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                URL: <code className="bg-muted px-1 rounded">{page.url}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Browser Screenshot Instructions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Chrome/Edge</h3>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Press F12 to open Developer Tools</li>
                <li>2. Click the Device Toolbar icon (mobile/tablet icon)</li>
                <li>3. Click the Screenshot icon (camera)</li>
                <li>4. Choose "Capture full size screenshot"</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium mb-2">Firefox</h3>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Press F12 to open Developer Tools</li>
                <li>2. Click the Settings gear icon</li>
                <li>3. Enable "Take a screenshot of the entire page"</li>
                <li>4. Click the camera icon in toolbar</li>
              </ol>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-muted">
          <h2 className="text-lg font-semibold mb-2">Recommended File Names</h2>
          <div className="grid gap-2 text-sm">
            <div><code>loanflow-dashboard.png</code> - Dashboard overview</div>
            <div><code>loanflow-pipeline.png</code> - Pipeline management</div>
            <div><code>loanflow-leads.png</code> - Lead management</div>
            <div><code>loanflow-enterprise.png</code> - Enterprise tools</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Screenshots;