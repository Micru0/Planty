import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"
// import Nodemailer from "next-auth/providers/nodemailer"
// import { createTransport } from "nodemailer"
// import { text } from "@/lib/authSendRequest"
// import { VerificationEmail } from "@/components/email/VerificationEmail"
// import { render } from '@react-email/render';
// import config from "@/config";


// Extend the Session type to include supabaseAccessToken
declare module 'next-auth' {
	interface Session {
		supabaseAccessToken?: string
	}
}

const handler = NextAuth({
	...authConfig,
	// The providers are inherited from auth.config.ts now
})

export const { auth, signIn, signOut } = handler
export const { GET, POST } = handler.handlers