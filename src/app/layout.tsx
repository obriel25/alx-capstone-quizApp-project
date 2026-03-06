import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QuizProvider } from "@/context/QuizContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuizMaster - Test Your Knowledge",
  description: "A fun quiz app to test your knowledge on various topics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-900`}>
        <QuizProvider>
          <Navbar />
          <main>{children}</main>
        </QuizProvider>
      </body>
    </html>
  );
}
