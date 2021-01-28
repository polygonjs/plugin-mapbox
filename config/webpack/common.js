const argv = require('yargs').argv;
const FAST_COMPILE = argv.env.FAST_COMPILE || false;
const TYPESCRIPT_TRANSPILE_ONLY = FAST_COMPILE;

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const webpack = require('webpack');

// loaders
const ts = require('./loaders/ts');

const plugins = [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
		title: 'Index',
		// filename: 'index.html',
		chunks: ['all'],
	}),
];

module.exports = (env = {}) => {
	const dist_path = path.resolve(__dirname, env.DIST_PATH ? env.DIST_PATH : '../../dist');

	return {
		context: path.resolve(__dirname, '../../'), // to automatically find tsconfig.json
		entry: {
			index: './src/index.ts',
		},
		plugins: plugins,
		output: {
			filename: '[name].js',
			library: 'PolyPluginMapbox',
		},
		resolve: {
			extensions: ['.ts', '.js'],
		},
		module: {
			rules: [ts(env, TYPESCRIPT_TRANSPILE_ONLY)],
		},
	};
};
