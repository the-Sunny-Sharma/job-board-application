import { Helmet } from 'react-helmet-async'

// 🔖 SEO Best Practices:
// title       → appears in browser tab + Google results (50-60 chars)
// description → appears under title in Google (150-160 chars)
// og:*        → appears when shared on LinkedIn/Twitter/WhatsApp
// canonical   → tells Google which URL is the "real" one

function SEO({ title, description, image, url }) {
  const siteTitle = 'JobBoard — Find Your Dream Job'
  const fullTitle = title ? `${title} | JobBoard` : siteTitle
  const defaultDesc = 'Browse hundreds of tech jobs. Apply with your resume in seconds.'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />

      {/* Open Graph — LinkedIn, Facebook, WhatsApp previews */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:type"        content="website" />
      {url   && <meta property="og:url"   content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />

      {/* Canonical URL — prevents duplicate content penalty */}
      {url && <link rel="canonical" href={url} />}
    </Helmet>
  )
}

export default SEO