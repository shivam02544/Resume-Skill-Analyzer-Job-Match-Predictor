import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Resume Analyzer",
  description: "Simple Resume Skill Analyzer",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b sticky top-0 z-50 backdrop-blur-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(248, 250, 252, 0.9)' }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center">
                <Link href="/" className="font-bold text-base sm:text-lg text-(--text-primary)">
                  📄 Resume Analyzer
                </Link>
              </div>
              <div className="flex space-x-4 sm:space-x-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-(--text-secondary) hover:text-(--primary) transition-colors"
                >
                  Upload
                </Link>
                <Link
                  href="/history"
                  className="text-sm font-medium text-(--text-secondary) hover:text-(--primary) transition-colors"
                >
                  History
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="grow py-5 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
