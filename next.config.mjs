/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow <img> tags to load images from any https host (pasted URLs + placeholders).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // Allow larger uploads through server actions (default is 1 MB).
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
