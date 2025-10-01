import { Metadata } from "next";

import { siteConfig } from "@/config/site";

interface PageMetadataConfig {
  title?: string;
  description?: string;
  keywords?: readonly string[] | string[];
  openGraph?: {
    title?: string;
    description?: string;
    images?: string[];
  };
  twitter?: {
    title?: string;
    description?: string;
  };
}

export function generatePageMetadata(config: PageMetadataConfig): Metadata {
  const title = config.title
    ? `${config.title} | ${siteConfig.name}`
    : siteConfig.name;

  const description = config.description || siteConfig.description;

  return {
    title,
    description,
    keywords: config.keywords
      ? [...config.keywords, siteConfig.name]
      : undefined,
    openGraph: {
      title: config.openGraph?.title || title,
      description: config.openGraph?.description || description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: config.openGraph?.images || [
        {
          url: `${siteConfig.url}/og-image.png`,
          width: 1200,
          height: 631,
          alt: siteConfig.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.twitter?.title || title,
      description: config.twitter?.description || description,
      images: config.openGraph?.images
        ? [...config.openGraph.images]
        : [`${siteConfig.url}/og-image.png`],
      creator: "@orbitum",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function createPageMetadataConfig(
  config: PageMetadataConfig,
): PageMetadataConfig {
  return config;
}

export const pageMetadataConfigs = {
  dashboard: createPageMetadataConfig({
    title: "Dashboard",
    description: "Deposit and stake your assets to earn rewards.",
    keywords: ["dashboard", "bond staking", "deposit"],
  }),
  auth: createPageMetadataConfig({
    title: "Authentication",
    description: "Securely access your account.",
    keywords: ["auth", "login", "register"],
  }),
  bondStaking: createPageMetadataConfig({
    title: "Bond Staking",
    description: "Stake your assets to earn rewards.",
    keywords: ["bond", "staking", "rewards"],
  }),
  deposit: createPageMetadataConfig({
    title: "Deposit",
    description: "Deposit your assets to earn rewards.",
    keywords: ["deposit", "rewards"],
  }),
  onboard: createPageMetadataConfig({
    title: "Onboard",
    description: "Get started with our platform.",
    keywords: ["onboard", "getting started"],
  }),
  portfolioHistory: createPageMetadataConfig({
    title: "Portfolio History",
    description: "View your portfolio's performance over time.",
    keywords: ["portfolio", "history", "performance"],
  }),
  register: createPageMetadataConfig({
    title: "Register",
    description: "Create a new account to get started.",
    keywords: ["register", "signup", "create account"],
  }),
};
