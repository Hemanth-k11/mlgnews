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
  // The staff area used to live under /admin. Old bookmarks and emailed links
  // (query string included) keep working by forwarding to the new address.
  // Temporary (307) on purpose, so browsers don't cache it if the path changes again.
  async redirects() {
    return [
      { source: "/admin", destination: "/newsroom", permanent: false },
      { source: "/admin/:path*", destination: "/newsroom/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
