// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Evita que Next empaquete el SDK; úsalo como dependencia externa en el server
    serverComponentsExternalPackages: ['conekta'],
  },
  webpack: (config) => {
    // Doble cinturón: marca conekta como external en el server build
    if (!config.externals) config.externals = [];
    config.externals.push({ conekta: 'commonjs conekta' });
    return config;
  },
};
module.exports = nextConfig;
