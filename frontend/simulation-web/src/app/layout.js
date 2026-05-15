import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NFC Access Control System | University Security",
  description: "Secure, NFC-based identity verification system for university administrative offices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}
