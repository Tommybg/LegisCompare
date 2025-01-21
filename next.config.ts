import { NextConfig } from 'next';

const config: NextConfig = {
    env: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
    // Enable if you want more detailed build logs
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    // Add any other Next.js config options you need
};

export default config;