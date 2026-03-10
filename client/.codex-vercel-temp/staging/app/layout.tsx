import type { Metadata } from "next";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import ChatWidget from "@/components/chatbot";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmileCare – Premium Luxury Dental Clinic",
  description: "Clinical excellence meets luxury dental care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${notoSerif.variable} ${notoSans.variable} antialiased font-body bg-background-light text-slate-900 min-h-screen`}
      >
        <ToastProvider>
          <AuthProvider>
            {children}
            {process.env.NEXT_PUBLIC_CHATBOT_ENABLED === 'true' && (
              <ChatWidget />
            )}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
