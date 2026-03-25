export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/uploader/", "/uploader-activity/"],
    },
    sitemap: "https://www.nosenvera.com/sitemap.xml",
  };
}
