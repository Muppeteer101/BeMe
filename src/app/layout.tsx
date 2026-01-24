import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CarDamage AI - Instant Car Damage Assessment',
  description:
    'Upload photos of your damaged car and get an instant AI-powered assessment. Know repair costs, identify damaged parts, and make informed decisions about your vehicle.',
  keywords: [
    'car damage assessment',
    'auto repair estimate',
    'car accident damage',
    'vehicle repair cost',
    'AI damage assessment',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">CarDamage AI</span>
              </a>

              <nav className="hidden md:flex items-center space-x-6">
                <a href="/#how-it-works" className="text-gray-600 hover:text-gray-900">
                  How It Works
                </a>
                <a href="/#pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
                <a href="/#faq" className="text-gray-600 hover:text-gray-900">
                  FAQ
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-white">CarDamage AI</span>
                </div>
                <p className="text-sm max-w-md">
                  Get instant AI-powered car damage assessments. Upload photos and receive
                  detailed repair estimates, part recommendations, and repair-vs-replace
                  guidance.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/" className="hover:text-white">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/#how-it-works" className="hover:text-white">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="/#pricing" className="hover:text-white">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/#faq" className="hover:text-white">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/privacy" className="hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/disclaimer" className="hover:text-white">
                      Disclaimer
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
              <p>&copy; {new Date().getFullYear()} CarDamage AI. All rights reserved.</p>
              <p className="mt-2 text-xs">
                Assessments are estimates only and should not replace professional inspection.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
