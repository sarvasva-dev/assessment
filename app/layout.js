// ClerkProvider component import kar rahe hain jo pure app ko authentication context dega
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

/**
 * Root Layout Component
 * Yeh component Next.js app ka entry point hai.
 * Yahan hum HTML tag, body tag aur global configurations setup karte hain.
 * Har page isi layout ke andar render hoga.
 */

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://assessment.sarthakml.in'),
  title: 'TestPlatform | Next-Generation Online Assessments',
  description: 'Enterprise-grade online MCQ test platform for Colleges & Coaching Institutes. Features anti-cheat, dynamic forms, and comprehensive analytics.',
  keywords: ['online exam', 'assessment platform', 'mcq test', 'anti-cheat exam', 'student evaluation'],
  authors: [{ name: 'TestPlatform' }],
  openGraph: {
    title: 'TestPlatform | Enterprise Assessments',
    description: 'Conduct secure, cheat-proof online examinations with TestPlatform. Built for modern educators.',
    url: 'https://testplatform.example.com',
    siteName: 'TestPlatform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TestPlatform Preview Image',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TestPlatform | Enterprise Assessments',
    description: 'Conduct secure, cheat-proof online examinations with TestPlatform.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    // ClerkProvider pure HTML tree ko wrap kar raha hai taaki auth state har jagah available ho
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* 'children' prop mein saare pages (jaise page.js) render hote hain */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
