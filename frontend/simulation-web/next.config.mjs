/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to Express backend during development ONLY.
  // In production the app calls the backend directly via NEXT_PUBLIC_BACKEND_URL.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
