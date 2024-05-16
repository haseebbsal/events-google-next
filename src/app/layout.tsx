import type { Metadata } from "next";
import { Inter } from "next/font/google";
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import NextAuthProvider from "@/providers/NextProvider";
import QueryProvider from "@/providers/QueryProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Google Events Calendar",
  description: "Add Events To Your Calendar",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session=await getServerSession(authOptions)
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider session={session}>
          <QueryProvider>
          {children}
          </QueryProvider>
        </NextAuthProvider>
        <script async window_extracting='deep-dive-analytics' data-id='21' src="http://localhost:7080/js/listening.js"></script>
      </body>
    </html>
  );
}
