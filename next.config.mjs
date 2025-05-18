import { withNextVideo } from "next-video/process";
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: [
      "s4.anilist.co",
      "media.kitsu.io",
      "artworks.thetvdb.com",
      "i.animepahe.com",
      "cdn.myanimelist.net",
      "img.youtube.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.anilist.co",
      },
    ],
  },
};

export default withNextVideo(nextConfig);