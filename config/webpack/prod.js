const argv = require('yargs').argv;
const FAST_COMPILE = argv.env.FAST_COMPILE || false;
const path = require('path');
const MINIFY = true;

const fs = require('fs');
const {merge} = require('webpack-merge');
const common = require('./common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
var {AggressiveMergingPlugin} = require('webpack').optimize;

const PLUGIN_VERSION = JSON.stringify(require('../../package.json').version);

module.exports = (env) => {
	const common_options = common(env);

	// common_options.plugins.push(new UglifyJsWebpackPlugin()); //minify everything // no need, terser (below is better)
	if (MINIFY) {
		common_options.plugins.push(new AggressiveMergingPlugin()); //Merge chunks
		common_options.plugins.push(
			new CompressionPlugin({
				test: /\.(js)$/,
			})
		); // gz by default
		common_options.plugins.push(
			new CompressionPlugin({
				filename: '[file].br',
				algorithm: 'brotliCompress',
				test: /\.(js|css|html|svg)$/,
				compressionOptions: {level: 11},
				threshold: 10240,
				minRatio: 0.8,
			})
		);
	}

	// currently not using contenthash since we will fetch the generated file with a version anyway
	// ie: https://unpkg.com/polygonjs-engine@1.1.23/dist/polygonjs-engine.js
	common_options.output.chunkFilename = '[name].js'; //'[name].[contenthash].js';
	common_options.output.publicPath = `https://unpkg.com/polygonjs-plugin-mapbox@${PLUGIN_VERSION}/dist/`; // a default is needed
	if (env.PUBLIC_PATH) {
		common_options.output.publicPath = env.PUBLIC_PATH; // this may be crucial to update depending on the build
	}
	common_options.output.libraryTarget = 'commonjs2';

	const config = merge(common_options, {
		mode: 'production',
		devtool: 'source-map',
		optimization: {
			chunkIds: 'named',
			// { automaticNameDelimiter?, automaticNameMaxLength?, cacheGroups?, chunks?, enforceSizeThreshold?, fallbackCacheGroup?, filename?, hidePathInfo?, maxAsyncRequests?, maxInitialRequests?, maxSize?, minChunks?, minSize?, name? }
			splitChunks: {
				chunks: 'async', // if chunks is 'all', it seems that the first chunks, like vendors, need to be included manually, which isn't great.
				minSize: 20000,
				// minRemainingSize: 0,
				maxSize: 0,
				minChunks: 1,
				maxAsyncRequests: 30000,
				maxInitialRequests: 30000,
				automaticNameDelimiter: '~',
				enforceSizeThreshold: 50000,
				cacheGroups: {
					mapbox: {
						test: /[\\/].*mapbox.*[\\/]/,
						priority: -10,
						reuseExistingChunk: true,
					},
					defaultVendors: {
						test: /[\\/]node_modules[\\/]/,
						priority: -20,
						reuseExistingChunk: true,
					},
					default: {
						minChunks: 2,
						priority: -20,
						reuseExistingChunk: true,
					},
				},
			},

			minimize: MINIFY,
			minimizer: [
				new TerserPlugin({
					extractComments: true,
					parallel: true,
				}),
			],
		},
	});

	// console.log('write debug');
	// const debug_config_path = path.resolve(__dirname, './debug_prod_config.json');
	// fs.writeFileSync(debug_config_path, JSON.stringify(config, null, 4));

	return config;
};
