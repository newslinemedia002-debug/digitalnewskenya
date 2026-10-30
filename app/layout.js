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
  keywords: [
    'Kenya news',
    'Kenya news today',
    'breaking news Kenya',
    'news Kenya',
    'Nairobi news',
    'Kenya politics',
    'Kenya business news',
    'business news Kenya today',
    'Africa news',
    'Kenya technology news',
    'world news',
    'digital newspaper Kenya',
    'Kenya online news',
    'Digital News Kenya',
  ],
  applicationName: SITE_NAME,
  // Permissive preview hints: allow large image previews (Google Discover /
  // image search) and let Google choose snippet length — including content
  // usable in AI Overviews and AI Mode.
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
  // Search-engine ownership checks (Yandex Webmaster; Bing is verified by
  // GSC import, so it needs no tag here).
  verification: {
    yandex: '69e1624ebc652ca9',
  },
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

// Organization + WebSite schema so Google and AI answer engines can read who
// publishes the site and offer a sitelinks search box.
const schemaJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: siteUrl(),
      logo: { '@type': 'ImageObject', url: `${siteUrl()}/logo.svg` },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl(),
      description: SITE_DESCRIPTION,
      inLanguage: 'en-KE',
      publisher: { '@type': 'NewsMediaOrganization', name: SITE_NAME, url: siteUrl() },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl()}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
