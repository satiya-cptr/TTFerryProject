import type { Metadata } from "next";
import { Ubuntu, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import { Providers } from "./providers";
import Footer from "@/components/ui/footer";


const ubuntu = Ubuntu({
  weight: ['400', '500', '700'],
  subsets: ["latin"], 
  variable: "--font-ubuntu",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "TT Ferry",
  description: "Ticketing and Scheduling for the TTIT Ferry Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ubuntu.variable} ${inter.variable} ${interTight.variable} font-inter`}
      >
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
