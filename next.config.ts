import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "media.rawg.io" },
      { protocol: "https", hostname: "coverartarchive.org" },
      { protocol: "https", hostname: "lastfm.freetls.fastly.net" },
    ],
  },
};

export default nextConfig;
