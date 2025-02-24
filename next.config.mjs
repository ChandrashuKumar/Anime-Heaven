import { withNextVideo } from "next-video/process";
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["cdn.myanimelist.net"],
      },
};

export default withNextVideo(nextConfig);