import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface MicrosoftUserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle OAuth callback (GET request with code parameter)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ type: 'microsoft_auth_error', error: '${error}' }, '*');
                window.close();
              </script>
              <p>Authentication failed. You can close this window.</p>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html', ...corsHeaders }
        });
      }

      if (!code || !state) {
        return new Response('Missing code or state parameter', { status: 400 });
      }

      // Exchange code for tokens
      const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')!;
      const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')!;
      const redirectUri = `${supabaseUrl}/functions/v1/microsoft-auth`;

      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange error:', errorText);
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ type: 'microsoft_auth_error', error: 'Failed to exchange code' }, '*');
                window.close();
              </script>
              <p>Authentication failed. You can close this window.</p>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html', ...corsHeaders }
        });
      }

      const tokens: MicrosoftTokenResponse = await tokenResponse.json();

      // Get user profile
      const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (!profileResponse.ok) {
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ type: 'microsoft_auth_error', error: 'Failed to get profile' }, '*');
                window.close();
              </script>
              <p>Authentication failed. You can close this window.</p>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html', ...corsHeaders }
        });
      }

      const profile: MicrosoftUserProfile = await profileResponse.json();
      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

      // Store tokens using the user_id from state
      const { error: dbError } = await supabase
        .from('email_accounts')
        .upsert({
          user_id: state,
          email_address: profile.mail || profile.userPrincipalName,
          display_name: profile.displayName,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        }, {
          onConflict: 'user_id,email_address',
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ type: 'microsoft_auth_error', error: 'Database error' }, '*');
                window.close();
              </script>
              <p>Failed to save account. You can close this window.</p>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html', ...corsHeaders }
        });
      }

      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'microsoft_auth_success', 
                email: '${profile.mail || profile.userPrincipalName}',
                name: '${profile.displayName}'
              }, '*');
              window.close();
            </script>
            <p>Email account connected successfully! You can close this window.</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // Handle POST requests (JSON API)
    const { action, code, state } = await req.json();
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Microsoft Auth action: ${action} for user: ${user.id}`);

    switch (action) {
      case 'get_auth_url': {
        const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')!;
        const redirectUri = `${supabaseUrl}/functions/v1/microsoft-auth`;
        const scope = 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access';
        
        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
          `client_id=${clientId}&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(scope)}&` +
          `state=${user.id}&` +
          `response_mode=query`;

        return new Response(JSON.stringify({ auth_url: authUrl }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'exchange_code': {
        const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')!;
        const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')!;
        const redirectUri = `${supabaseUrl}/functions/v1/microsoft-auth`;

        // Exchange code for tokens
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange error:', errorText);
          throw new Error('Failed to exchange code for tokens');
        }

        const tokens: MicrosoftTokenResponse = await tokenResponse.json();

        // Get user profile from Microsoft Graph
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to get user profile');
        }

        const profile: MicrosoftUserProfile = await profileResponse.json();

        // Calculate expiry time
        const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

        // Store or update email account in database
        const { error: dbError } = await supabase
          .from('email_accounts')
          .upsert({
            user_id: user.id,
            email_address: profile.mail || profile.userPrincipalName,
            display_name: profile.displayName,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: expiresAt.toISOString(),
            is_active: true,
          }, {
            onConflict: 'user_id',
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        return new Response(JSON.stringify({ 
          success: true,
          profile: {
            email: profile.mail || profile.userPrincipalName,
            name: profile.displayName,
          }
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'send_email': {
        const { to, subject, body, cc, bcc } = await req.json();

        // Get active email account
        const { data: emailAccount, error: accountError } = await supabase
          .from('email_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (accountError || !emailAccount) {
          throw new Error('No active email account found');
        }

        // Check if token needs refresh
        const now = new Date();
        const expiresAt = new Date(emailAccount.expires_at);
        
        let accessToken = emailAccount.access_token;
        
        if (now >= expiresAt) {
          // Refresh token logic would go here
          console.log('Token expired, refresh needed');
        }

        // Send email via Microsoft Graph
        const emailData = {
          message: {
            subject: subject,
            body: {
              contentType: 'HTML',
              content: body,
            },
            toRecipients: to.map((email: string) => ({
              emailAddress: { address: email }
            })),
            ...(cc && cc.length > 0 && {
              ccRecipients: cc.map((email: string) => ({
                emailAddress: { address: email }
              }))
            }),
            ...(bcc && bcc.length > 0 && {
              bccRecipients: bcc.map((email: string) => ({
                emailAddress: { address: email }
              }))
            }),
          }
        };

        const sendResponse = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (!sendResponse.ok) {
          const errorText = await sendResponse.text();
          console.error('Send email error:', errorText);
          throw new Error('Failed to send email');
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Error in microsoft-auth function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});