import { Button } from "@/components/ui/button";
import { Camera, Download, ExternalLink, Navigation } from "lucide-react";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { IBMPageHeader } from "@/components/ui/IBMPageHeader";
import { StandardContentCard } from "@/components/StandardContentCard";
import { StandardKPICard } from "@/components/StandardKPICard";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
      const fileName = `loanflow-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      const newWindow = window.open(url, '_blank', 'width=1920,height=1080');
      
      if (newWindow) {
        toast({
          title: "Page Opened for Screenshot",
          description: `Opening ${title}. Use browser screenshot tools or OS shortcuts to capture. Recommended filename: ${fileName}`,
        });
      } else {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site to use the screenshot feature.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to open page:', error);
      toast({
        title: "Failed to Open Page",
        description: "Unable to open the page. Please check your browser settings.",
        variant: "destructive",
      });
    }
  };

  const openPageInNewTab = (url: string) => {
    try {
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        toast({
          title: "Page Opened",
          description: "Page opened in new tab",
        });
      } else {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to open page:', error);
      toast({ title: "Failed to Open Page", variant: "destructive" });
    }
  };

  return (
    <StandardPageLayout>
      <IBMPageHeader 
        title="Screenshot Command Center"
        subtitle="Capture and manage CRM system screenshots for presentations"
      />

      <ResponsiveContainer>
        <div className="space-y-6">
          {/* Screenshot Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StandardKPICard 
              title="Available Pages"
              value={pages.length}
            />
            <StandardKPICard 
              title="Screenshot Tools"
              value="3"
            />
            <StandardKPICard 
              title="Browser Support"
              value="All"
            />
            <StandardKPICard 
              title="Export Formats"
              value="PNG"
            />
          </div>

          <StandardContentCard title="How to Take Screenshots" className="bg-primary/5 border-primary/20">
            <div className="space-y-2 text-sm">
              <p><strong>Method 1:</strong> Click "Take Screenshot" → Use browser's built-in screenshot tool</p>
              <p><strong>Method 2:</strong> Click "Open Page" → Use your OS screenshot tool (Windows: Win+Shift+S, Mac: Cmd+Shift+4)</p>
              <p><strong>Method 3:</strong> Use browser extensions like "Full Page Screen Capture"</p>
            </div>
          </StandardContentCard>
          
          <div className="grid gap-4 md:grid-cols-2">
            {pages.map((page, index) => (
              <StandardContentCard key={index} title={page.title}>
                <p className="text-sm text-muted-foreground mb-4">{page.description}</p>
                <div className="space-y-3">
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
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    URL: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{page.url}</code>
                  </div>
                </div>
              </StandardContentCard>
            ))}
          </div>
          
          <StandardContentCard title="Browser Screenshot Instructions">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Chrome/Edge</h3>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Press F12 to open Developer Tools</li>
                  <li>Click the Device Toolbar icon (mobile/tablet icon)</li>
                  <li>Click the Screenshot icon (camera)</li>
                  <li>Choose "Capture full size screenshot"</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Firefox</h3>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Press F12 to open Developer Tools</li>
                  <li>Click the Settings gear icon</li>
                  <li>Enable "Take a screenshot of the entire page"</li>
                  <li>Click the camera icon in toolbar</li>
                </ol>
              </div>
            </div>
          </StandardContentCard>

          <StandardContentCard title="Recommended File Names">
            <div className="grid gap-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded">loanflow-dashboard.png</code>
                <span className="text-muted-foreground">- Dashboard overview</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded">loanflow-pipeline.png</code>
                <span className="text-muted-foreground">- Pipeline management</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded">loanflow-leads.png</code>
                <span className="text-muted-foreground">- Lead management</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded">loanflow-enterprise.png</code>
                <span className="text-muted-foreground">- Enterprise tools</span>
              </div>
            </div>
          </StandardContentCard>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  );
};

export default Screenshots;