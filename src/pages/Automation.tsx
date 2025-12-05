import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IBMPageHeader } from "@/components/ui/IBMPageHeader";
import { SmartDocumentCategorizer } from "@/components/automation/SmartDocumentCategorizer";
import { AutomatedReminders } from "@/components/automation/AutomatedReminders";
import { BulkLeadAssignment } from "@/components/automation/BulkLeadAssignment";
import { Brain, Bell, Users } from "lucide-react";

export default function Automation() {
  return (
    <div className="space-y-6">
      <IBMPageHeader
        title="Automation & Efficiency"
        subtitle="Smart tools to streamline your workflow"
      />

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Document AI
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Assign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <SmartDocumentCategorizer />
        </TabsContent>

        <TabsContent value="reminders">
          <AutomatedReminders />
        </TabsContent>

        <TabsContent value="assignment">
          <BulkLeadAssignment />
        </TabsContent>
      </Tabs>
    </div>
  );
}
