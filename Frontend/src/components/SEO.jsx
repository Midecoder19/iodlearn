import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogUrl, 
  twitterCard = 'summary_large_image',
  schema 
}) => {
  const defaultTitle = 'Iodlearn - Online Learning Platform with Expert Mentorship';
  const defaultDescription = 'Iodlearn is a comprehensive online learning platform offering courses, mentorship, and educational resources. Learn from expert mentors and advance your career.';
  const defaultKeywords = 'online learning, courses, mentorship, education, programming, web development, data science, mobile development, design, business, marketing';
  const defaultImage = 'https://iodlearn.vercel.app/logo.png';
  const defaultUrl = 'https://iodlearn.vercel.app';

  const finalTitle = title ? `${title} | Iodlearn` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = ogImage || defaultImage;
  const finalUrl = ogUrl || defaultUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content="Iodlearn" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={finalUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={finalUrl} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
