import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { UserSyncProvider } from "@/components/user-sync-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hiring Management System",
  description: "Internal hiring management system with pipeline tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SignedOut>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Hiring Management System
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Sign in to access the hiring pipeline
                  </p>
                  <SignInButton mode="modal">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors">
                      Sign in with Google
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </SignedOut>
          
          <SignedIn>
            <UserSyncProvider>
              <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <h1 className="text-xl font-semibold text-gray-900">
                        Hiring System
                      </h1>
                      <nav className="flex gap-4">
                        <a 
                          href="/pipeline" 
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Pipeline
                        </a>
                        <a 
                          href="/candidates" 
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Candidates
                        </a>
                        <a 
                          href="/users" 
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Users
                        </a>
                        <a 
                          href="/reports" 
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Reports
                        </a>
                      </nav>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </header>
                <main>
                  {children}
                </main>
              </div>
            </UserSyncProvider>
          </SignedIn>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}