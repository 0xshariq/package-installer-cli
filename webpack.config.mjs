import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './dist/index.js',
  target: 'node',
  mode: 'production',
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'binary/temp'),
    filename: 'cli-with-packages.js',
    module: true,
    library: {
      type: 'module',
    },
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  externalsType: 'node-commonjs',
  externals: [
    // Don't bundle Node.js built-ins
    'fs', 'path', 'os', 'crypto', 'events', 'util', 'stream', 'child_process',
    'url', 'querystring', 'buffer', 'process', 'http', 'https', 'net', 'tls', 'zlib',
    'dns', 'dgram', 'readline', 'tty', 'assert', 'constants', 'module', 'vm',
    'string_decoder', 'timers', 'worker_threads',
  ],
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
  optimization: {
    minimize: false,
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  performance: {
    hints: false,
    maxAssetSize: 10 * 1024 * 1024, // 10MB
    maxEntrypointSize: 10 * 1024 * 1024, // 10MB
  },
};
