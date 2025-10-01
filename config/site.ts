export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Kizo",
  description: "Kizo is a decentralized finance platform.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
