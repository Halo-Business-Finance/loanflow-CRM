import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Cloud, Building } from "lucide-react"
import { EmailSetup } from "@/components/EmailSetup"
import { RingCentralSetup } from "@/components/RingCentralSetup"

export function ConnectionHalo() {
  const [isOpen, setIsOpen] = useState(false)
  
  console.log('ConnectionHalo component rendered', { isOpen })

  const HaloButton = () => {
    console.log('HaloButton rendering')
    return (
      <div className="flex flex-col items-center gap-1 ml-2">
        <button
          onClick={() => {
            console.log('Halo button clicked!')
            setIsOpen(true)
          }}
          className="relative w-20 h-12 group transition-colors duration-200 flex flex-col items-center justify-center"
          style={{
            clipPath: `polygon(
              0% 20%, 20% 20%, 20% 0%, 40% 0%, 40% 20%, 60% 20%, 60% 0%, 80% 0%, 80% 20%, 100% 20%,
              100% 40%, 80% 40%, 80% 60%, 100% 60%, 100% 80%, 80% 80%, 80% 100%, 60% 100%, 60% 80%,
              40% 80%, 40% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 60%, 20% 60%, 20% 40%, 0% 40%
            )`
          }}
          aria-label="Open connections"
        >
          {/* Cloud icon */}
          <Cloud className="w-5 h-5 text-white group-hover:text-white/90 mb-0.5" />
          {/* Halo Apps text inside */}
          <span className="text-[8px] font-medium text-white group-hover:text-white/90 leading-none">
            Halo Apps
          </span>
        </button>
      </div>
    )
  }

  return (
    <>
      <HaloButton />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Cloud className="w-6 h-6 text-primary" />
              Connect Your Applications
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-sm text-muted-foreground">
              Connect your Microsoft 365 and RingCentral accounts to unlock powerful integrations and streamline your workflow.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Microsoft 365 Card */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-navy/10 dark:bg-navy/20">
                      <Building className="w-5 h-5 text-navy dark:text-navy-light" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Microsoft 365</CardTitle>
                      <CardDescription>Email, Calendar & Office Apps</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Connect your Microsoft 365 account to:
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      Send emails directly from CRM
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      Sync calendar events
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      Access Office documents
                    </li>
                  </ul>
                  <EmailSetup 
                    trigger={
                      <Button className="w-full bg-navy hover:bg-navy-light text-white">
                        Connect Microsoft 365
                      </Button>
                    }
                  />
                </CardContent>
              </Card>

              {/* RingCentral Card */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">RingCentral</CardTitle>
                      <CardDescription>Business Communications</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Connect your RingCentral account to:
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      Make calls from CRM
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      Log call activities
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      Access call recordings
                    </li>
                  </ul>
                  <RingCentralSetup 
                    trigger={
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Connect RingCentral
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Security & Privacy</h4>
              <p className="text-xs text-muted-foreground">
                All connections use OAuth 2.0 secure authentication. We never store your passwords and only access the permissions you grant.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}