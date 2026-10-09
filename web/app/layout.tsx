import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Vouch — Pay when the post is live. Not before.",
  description: "Brands lock funds in a contract. Validators open the real post, check it against your brief, and release payment only if it complies.",
  openGraph: {
    title: "Vouch — Pay when the post is live. Not before.",
    description: "Creator deals, verified on-chain.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Vouch.", description: "Creator deals, verified on-chain." },
};

const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('vouch-theme');var t=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <WalletProvider>
        <ToastProvider>
          <a href="#main" style={{ position: "absolute", left: -9999 }}>Skip to content</a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
