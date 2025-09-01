import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Define allowed email domains
const ALLOWED_DOMAINS = ["allaith.com", "cg-tech.co", "thevirtulab.com"]

export const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow sign-in if user's email is from allowed domains
      const email = user.email || ""
      const emailDomain = email.split("@")[1]
      
      if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
        // Reject sign-in for unauthorized domains
        return false
      }
      
      return true
    },
    async session({ session, token }) {
      // Add custom fields to session if needed
      if (session.user?.email) {
        // You can add employee data here later
        // For example: session.user.employeeCode = await getEmployeeCode(session.user.email)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home page after sign in
      if (url === baseUrl || url === `${baseUrl}/`) {
        return baseUrl
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin", // Error page (we'll show errors on signin page)
  },
  session: {
    strategy: "jwt",
  },
  debug: false,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
