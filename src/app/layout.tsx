import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/contexts/SocketContext";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { HelpProvider } from "@/components/help/help-provider";
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext";
import { NotificationManager } from "@/components/notifications/notification-manager";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dozyr | The Future of Remote Working | Be your own boss #MeEO",
  description: "Join Dozyr, the premier platform for remote work opportunities. Connect with top talent and companies worldwide. Be your own boss and shape the future of work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>
            <AdminNotificationProvider>
              <ToastProvider>
                <EmailVerificationGuard>
                  <HelpProvider>
                    {children}
                    <NotificationManager />
                  </HelpProvider>
                </EmailVerificationGuard>
              </ToastProvider>
            </AdminNotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
