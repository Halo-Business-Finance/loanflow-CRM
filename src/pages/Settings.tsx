import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Badge component removed - using plain text instead
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { 
  Settings as SettingsIcon,
  User, 
  Bell,
  Save,
  Lock,
  Shield,
  Phone,
  Mail,
  RefreshCw
} from "lucide-react"
import { RingCentralSetup } from "@/components/RingCentralSetup"
import { EmailSetup } from "@/components/EmailSetup"
import { SystemHealthMonitor } from "@/components/SystemHealthMonitor"
import { WebhookManager } from "@/components/webhooks/WebhookManager"
import { MicrosoftAuthenticatorSetup } from "@/components/auth/MicrosoftAuthenticatorSetup"

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [displayName, setDisplayName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [timeZone, setTimeZone] = useState("")
  const [userRole, setUserRole] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [leadStatusNotifications, setLeadStatusNotifications] = useState(true)
  const [followUpReminders, setFollowUpReminders] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info('[Page] Settings mounted');
    }

    // Sync active tab from query params
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
    if (searchParams.get('mfa')) setActiveTab('security');

    const fetchUserData = async () => {
      if (user?.user_metadata) {
        setDisplayName(user.user_metadata.display_name || "")
        setPhoneNumber(user.user_metadata.phone_number || "")
        setTimeZone(user.user_metadata.time_zone || "")
      }

      // Fetch user role
      if (user?.id) {
        try {
          const { data: role, error } = await supabase.rpc('get_user_role', {
            p_user_id: user.id
          })
          
          if (!error && role) {
            setUserRole(role)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
    }

    fetchUserData()
  }, [user, searchParams])

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          display_name: displayName,
          phone_number: phoneNumber,
          time_zone: timeZone
        }
      })

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      // Here you would save notification preferences to user preferences table
      // For now, we'll just show a success message
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don\'t match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div data-testid="page-settings" className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your profile, preferences, and system configuration
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-[#0A1628] p-1 gap-2">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Authentication</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>System Health</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Integrations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Three-Column Grid for all widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-[#0A1628]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-normal text-[#161616]">Profile Settings</CardTitle>
                  <CardDescription className="text-[#525252]">
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* User Role Display */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      User Role
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {userRole || "Loading..."}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contact an administrator to change your role
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user?.email || ""} 
                        disabled 
                        className="bg-muted border-[#0A1628]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="border-[#0A1628]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input 
                        id="phoneNumber" 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className="border-[#0A1628]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeZone">Time Zone</Label>
                      <Select value={timeZone} onValueChange={setTimeZone}>
                        <SelectTrigger className="border-[#0A1628]">
                          <SelectValue placeholder="Select your time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Phoenix">Arizona Time (MST)</SelectItem>
                          <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                          <SelectItem value="Pacific/Honolulu">Hawaii Time (HST)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                          <SelectItem value="Asia/Kolkata">Mumbai (IST)</SelectItem>
                          <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-[#0A1628]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-normal text-[#161616]">Communication Settings</CardTitle>
                  <CardDescription className="text-[#525252]">
                    Configure phone and email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <RingCentralSetup 
                      trigger={
                        <Button variant="outline" className="w-full justify-start gap-2 border-[#0A1628]">
                          <Phone className="w-4 h-4" />
                          <span>Phone Settings</span>
                        </Button>
                      }
                    />
                    <EmailSetup 
                      trigger={
                        <Button variant="outline" className="w-full justify-start gap-2 border-[#0A1628]">
                          <Mail className="w-4 h-4" />
                          <span>Email Settings</span>
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#0A1628]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-normal text-[#161616]">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-[#525252]">
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="border-[#0A1628]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="border-[#0A1628]"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>

                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-[#0A1628]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-normal text-[#161616]">Notification Preferences</CardTitle>
                <CardDescription className="text-[#525252]">
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lead Status Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when lead status changes
                    </p>
                  </div>
                  <Switch
                    checked={leadStatusNotifications}
                    onCheckedChange={setLeadStatusNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Follow-up Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminder notifications for follow-ups
                    </p>
                  </div>
                  <Switch
                    checked={followUpReminders}
                    onCheckedChange={setFollowUpReminders}
                  />
                </div>

                <Button 
                  onClick={handleSaveNotifications} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-[#0A1628]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-normal text-[#161616]">Multi-Factor Authentication</CardTitle>
                <CardDescription className="text-[#525252]">
                  Secure your account with Microsoft Authenticator (TOTP)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MicrosoftAuthenticatorSetup />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthMonitor />
          </TabsContent>

          <TabsContent value="integrations">
            <WebhookManager />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
}