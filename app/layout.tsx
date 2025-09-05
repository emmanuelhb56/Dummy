import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ChatwootWidget from "@/src/app/componentes/ChatWidget";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ERPExpert - Software de gestión empresarial",
  description: "Software de gestión empresarial para empresas de todos los tamaños",
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
        {children}
      </body>
      <ChatwootWidget websiteToken={process.env.CHATWOOT_WEBSITE_TOKEN as string} baseUrl={process.env.CHATWOOT_URL as string} />
    </html>
  );
}