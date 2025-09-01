# Google OAuth Setup Guide

## Prerequisites
- Access to Google Cloud Console
- Project: `pmo-v2` (Project ID: `pmo-v2`)

## Steps to Set Up Google OAuth

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `pmo-v2`
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Select **Web application** as the application type
6. Configure the OAuth client:
   - **Name**: PMO Site Accreditation (or your preferred name)
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-production-domain.com/api/auth/callback/google` (for production)
7. Click **CREATE**
8. Save the **Client ID** and **Client Secret**

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **Internal** (since this is for your organization only)
3. Fill in the required information:
   - **App name**: PMO Site Accreditation
   - **User support email**: Your email
   - **Authorized domains**: Add your company domains
     - `allaith.com`
     - `cg-tech.co`
     - `thevirtulab.com`
4. Save and continue through the scopes (no additional scopes needed)

### 3. Environment Configuration

Create a `.env.local` file in the `untitled-ui` directory with the following:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Existing BigQuery Configuration (keep your existing values)
DATA_PROJECT_ID=al-laith-erp-system
DATASET_ID=allaith_erp_dbo
BIGQUERY_LOCATION=US
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

#### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### 4. Domain Restrictions

The application is configured to only allow sign-ins from these email domains:
- `@allaith.com`
- `@cg-tech.co`
- `@thevirtulab.com`

Users with email addresses from other domains will be rejected during sign-in.

### 5. Testing

1. Start the development server:
   ```bash
   bun run dev
   ```

2. Navigate to `http://localhost:3000`
3. You should be redirected to `/signin`
4. Click "Sign in with Google"
5. Use a Google account with one of the allowed email domains
6. After successful authentication, you'll be redirected to the main application

### 6. Production Deployment

For production:
1. Update the OAuth client with your production domain
2. Set appropriate environment variables in your production environment
3. Ensure HTTPS is enabled (required for OAuth)
4. Update `NEXTAUTH_URL` to your production URL

## Troubleshooting

### Common Issues

1. **"Access blocked" error**
   - Ensure your email domain is one of the allowed domains
   - Check that the OAuth consent screen is configured for "Internal" use

2. **Redirect URI mismatch**
   - Verify the redirect URI in Google Console matches exactly with your application
   - Check for trailing slashes or protocol differences (http vs https)

3. **Session not persisting**
   - Ensure `NEXTAUTH_SECRET` is set and consistent
   - Check that cookies are enabled in the browser

## Security Notes

- Never commit `.env.local` to version control
- Regularly rotate your `NEXTAUTH_SECRET`
- Monitor OAuth usage in Google Cloud Console
- Review sign-in logs periodically
