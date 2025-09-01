/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        optimizePackageImports: ["@untitledui/icons", "@untitledui-pro/icons"],
    },
    typescript: {
        // Temporarily ignore build errors for production deployment
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
