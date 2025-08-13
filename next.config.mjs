/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@untitledui/icons", "@untitledui-pro/icons"],
    },
};

export default nextConfig;
