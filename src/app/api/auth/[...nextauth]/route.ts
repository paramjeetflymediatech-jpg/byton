import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@admin.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For simple testing, we provide a default hardcoded admin account
        // Later this can query your Supabase users table.
        if (credentials?.email === 'admin@admin.com' && credentials?.password === 'admin123') {
          return { id: '1', name: 'Admin', email: 'admin@admin.com', role: 'ADMIN' };
        }
        
        // If login fails
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Attach role if present in token
      if (token.role) (session.user as any).role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
