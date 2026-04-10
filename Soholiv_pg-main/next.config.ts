import type { NextConfig } from "next";

const securityHeaders = [
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
]

if (process.env.NODE_ENV === 'production') {
    securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    })
}

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },

    // Compression
    compress: true,

    // Output file tracing for smaller builds
    output: 'standalone',

    // Experimental features for performance
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ]
    },

    // // Webpack optimizations
    // webpack: (config, { dev, isServer }) => {
    //     // Production optimizations
    //     if (!dev && !isServer) {
    //         config.optimization = {
    //             ...config.optimization,
    //             moduleIds: 'deterministic',
    //         }
    //     }
    //     return config
    // },
};

export default nextConfig;
