import "./globals.css";
import { QuizProvider } from "@/context/QuizContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "QuizMaster - Test Your Knowledge",
  description: "A fun quiz app to test your knowledge on various topics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 dark:bg-gray-900">
        <AuthProvider>
          <QuizProvider>
            <Navbar />
            <main>{children}</main>
          </QuizProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
