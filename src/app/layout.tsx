import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Construction Management App",
  description: "Aplikacja do zarządzania budowami",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

