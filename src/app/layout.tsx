import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeachWeb — AI-Powered 3D Website Builder & Spatial Studio",
  description:
    "Build interactive, scroll-choreographed 3D WebGL websites without code. Design UI layouts, customize 3D materials & shaders, animate scroll keyframes, and publish live in one click.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08090f] text-slate-50 antialiased selection:bg-[#ff6b4a]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
