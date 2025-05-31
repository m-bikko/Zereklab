/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['zereklab-images.s3.amazonaws.com', 'localhost'],
    unoptimized: true
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Ignore MongoDB optional dependencies that cause issues in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Ignore problematic MongoDB optional dependencies
    config.externals = config.externals || [];
    config.externals.push({
      'snappy': 'commonjs snappy',
      'aws4': 'commonjs aws4',
      'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      'kerberos': 'commonjs kerberos',
      'bson-ext': 'commonjs bson-ext',
      'gcp-metadata': 'commonjs gcp-metadata',
      'saslprep': 'commonjs saslprep',
    });

    return config;
  },
}

module.exports = nextConfig 