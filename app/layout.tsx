import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ChatwootWidget from "@/src/app/componentes/ChatWidget";
import Script from "next/script";
import { headers } from "next/headers";

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
  const nonce = headers().get("x-nonce") || "";
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* GTM con nonce */}
        <Script id="gtm" strategy="afterInteractive" nonce={nonce}>
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-K2XDNNN');`}
        </Script>
        {children}
         <ChatwootWidget websiteToken={"5cyoUG3ZQRuAa882Wmr8puBT"} baseUrl={"https://chatwoot-chatwoot.5hg9qc.easypanel.host"} />
      </body>
    </html>
  );
}