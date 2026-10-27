import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SITE_NAME, SITE_DESCRIPTION, siteUrl } from '@/lib/site'

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — Breaking news from Kenya and the world`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_KE',
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport = {
  themeColor: '#bb1919',
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: SITE_NAME,
  url: siteUrl(),
  logo: `${siteUrl}/logo.svg`,
}

// Applies the saved theme before first paint to avoid a flash of the wrong
// colours; falls back to the default dark theme.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`

export default function RootLayout({ children }) {
  return (
    <html lang="en-KE">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
