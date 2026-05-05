import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KejaRoom - Rooms & Roommates in Kenya",
  description: "Find rooms for rent and trustworthy roommates in Nairobi",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}