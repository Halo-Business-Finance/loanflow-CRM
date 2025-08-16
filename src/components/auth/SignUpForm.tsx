import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock, User, Shield } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !firstName || !lastName) return

    setIsLoading(true)
    try {
      await signUp(email, password, firstName, lastName)
    } catch (error) {
      // Error handling is done in the AuthProvider
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftSignUp = async () => {
    console.log('🚀 Starting Microsoft OAuth sign-up flow...')
    setIsMicrosoftLoading(true)
    
    try {
      // Get current origin for redirect
      const redirectUrl = `${window.location.origin}/`
      console.log('🔗 Sign-up Redirect URL:', redirectUrl)
      
      // Start OAuth flow for sign-up
      console.log('📝 Initiating Microsoft sign-up...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email',
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      })
      
      console.log('📊 Sign-up OAuth Response:', { data, error })
      
      if (error) {
        console.error('❌ Sign-up OAuth Error:', error)
        toast.error(`Microsoft sign-up failed: ${error.message}`)
        return
      }
      
      if (data?.url) {
        console.log('🌐 Redirecting to Microsoft for sign-up...', data.url)
        // Store intention to prevent loops
        localStorage.setItem('ms_oauth_signup_attempt', Date.now().toString())
        window.location.href = data.url
      } else {
        console.warn('⚠️ No redirect URL received for sign-up')
        toast.error('Microsoft sign-up failed: No redirect URL received')
      }
      
    } catch (error: any) {
      console.error('💥 Microsoft Sign-up Error:', error)
      toast.error(`Sign-up error: ${error.message || 'Unknown error'}`)
    } finally {
      // Only reset loading if we're not redirecting
      setTimeout(() => setIsMicrosoftLoading(false), 1000)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join our secure CRM platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Microsoft 365 Sign Up - Primary Option */}
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleMicrosoftSignUp}
            disabled={isMicrosoftLoading || isLoading}
            className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white border-0"
            size="lg"
          >
            {isMicrosoftLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to Microsoft...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
                  <path fill="currentColor" d="M1 1h10v10H1z"/>
                  <path fill="currentColor" d="M12 1h10v10H12z"/>
                  <path fill="currentColor" d="M1 12h10v10H1z"/>
                  <path fill="currentColor" d="M12 12h10v10H12z"/>
                </svg>
                Sign up with Microsoft 365
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || isMicrosoftLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account with Email
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onToggleMode}
            className="text-sm text-muted-foreground"
            disabled={isLoading || isMicrosoftLoading}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}