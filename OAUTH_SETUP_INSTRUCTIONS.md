# Google OAuth Setup Instructions for PMO Site Accreditation

## Direct Links
1. **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=pmo-v2
2. **Create Credentials**: https://console.cloud.google.com/apis/credentials?project=pmo-v2

## Step 1: Configure OAuth Consent Screen (if not already done)

1. Open: https://console.cloud.google.com/apis/credentials/consent?project=pmo-v2
2. Select **Internal** (IMPORTANT: This restricts access to your organization only)
3. Fill in the required fields:
   - **App name**: PMO Site Accreditation
   - **User support email**: Your email address
   - **Application logo**: (optional, skip for now)
   - **Application homepage URL**: http://localhost:3000 (update later for production)
   - **Authorized domains**: Leave empty for now (handled by Internal setting)
   - **Developer contact information**: Your email address
4. Click **SAVE AND CONTINUE**
5. On Scopes page: Click **SAVE AND CONTINUE** (no additional scopes needed)
6. On Summary page: Click **BACK TO DASHBOARD**

## Step 2: Create OAuth 2.0 Client ID

1. Open: https://console.cloud.google.com/apis/credentials?project=pmo-v2
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Configure as follows:

   **Application type**: Web application
   
   **Name**: PMO Site Accreditation
   
   **Authorized JavaScript origins** (click + ADD URI for each):
   - https://allaith-pmo.com
   - http://localhost:3000 (for local development)
   
   **Authorized redirect URIs** (click + ADD URI for each):
   - https://allaith-pmo.com/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google (for local development)

4. Click **CREATE**

## Step 3: Copy Your Credentials

After creation, you'll see a dialog with:
- **Client ID**: Copy this entire string
- **Client Secret**: Copy this entire string (keep it secure!)

Click **OK** to close the dialog.

## Step 4: Create .env.local file

Create a file named `.env.local` in your project directory with the following content:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cHS45j6wgmmWvt/GscGnZpYsaOosfKZezQNydrecyxw=

# Existing BigQuery Configuration
DATA_PROJECT_ID=al-laith-erp-system
DATASET_ID=allaith_erp_dbo
BIGQUERY_LOCATION=US
```

## Important Notes:

1. **Internal App**: By selecting "Internal" for the OAuth consent screen, only users with email addresses from your Google Workspace organization can sign in.

2. **Domain Restrictions**: The application code additionally restricts access to only these domains:
   - @allaith.com
   - @cg-tech.co
   - @thevirtulab.com

3. **Security**: Never share your Client Secret or commit it to version control.

## Step 5: Test the Setup

1. Save the `.env.local` file
2. Restart your development server
3. Visit http://localhost:3000
4. You should be redirected to /signin
5. Click "Sign in with Google"
6. Use an email from one of the allowed domains

## Troubleshooting:

- **"Access blocked" error**: Make sure the OAuth consent screen is set to "Internal"
- **"Redirect URI mismatch"**: Ensure the redirect URI matches exactly: http://localhost:3000/api/auth/callback/google
- **Still seeing "MissingSecret" errors**: Make sure .env.local is saved and restart the server

## For Production:

When deploying to production, you'll need to:
1. Add your production domain to Authorized JavaScript origins
2. Add your production callback URL to Authorized redirect URIs
3. Update NEXTAUTH_URL in your production environment variables
