import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Badge component removed - using plain text instead
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Settings, Trash2, GripVertical } from "lucide-react"

export default function StageManagement() {
  const stages = [
    { id: 1, name: "Prospecting", order: 1, probability: 10, color: "blue", active: true, dealCount: 15 },
    { id: 2, name: "Qualification", order: 2, probability: 25, color: "green", active: true, dealCount: 12 },
    { id: 3, name: "Proposal", order: 3, probability: 50, color: "yellow", active: true, dealCount: 8 },
    { id: 4, name: "Negotiation", order: 4, probability: 75, color: "orange", active: true, dealCount: 5 },
    { id: 5, name: "Closing", order: 5, probability: 90, color: "purple", active: true, dealCount: 3 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stage Management</h1>
        <p className="text-muted-foreground">
          Configure and manage your sales pipeline stages
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pipeline Stages</span>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          </CardTitle>
          <CardDescription>
            Drag and drop to reorder stages. Configure probability and settings for each stage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage) => (
              <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="cursor-move">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-2">
                    <div className="font-medium">{stage.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {stage.dealCount} active deals
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Order</div>
                    <div className="font-medium">{stage.order}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Probability</div>
                    <div className="font-medium">{stage.probability}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Switch checked={stage.active} />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Stage</CardTitle>
            <CardDescription>
              Create a new stage for your pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stageName">Stage Name</Label>
              <Input id="stageName" placeholder="Enter stage name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Win Probability (%)</Label>
              <Input id="probability" type="number" placeholder="50" min="0" max="100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageColor">Stage Color</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe this stage..." />
            </div>

            <Button className="w-full">Create Stage</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Settings</CardTitle>
            <CardDescription>
              Global settings for pipeline stages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-advance deals</div>
                <div className="text-sm text-muted-foreground">
                  Automatically move deals based on criteria
                </div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Required fields validation</div>
                <div className="text-sm text-muted-foreground">
                  Require certain fields before stage advancement
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Stage activity tracking</div>
                <div className="text-sm text-muted-foreground">
                  Track time spent in each stage
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultStage">Default Stage for New Deals</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select default stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staleTime">Mark deals as stale after (days)</Label>
              <Input id="staleTime" type="number" placeholder="30" />
            </div>

            <Button className="w-full">Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}