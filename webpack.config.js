const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
	entry: {
		main: [
			'babel-polyfill',
			'./src/js/client/index.js',
			'./src/scss/index.scss'
		]
	},

	devtool: '#source-map',

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
		sourceMapFilename: '[file].source.map'
	},

	node: {
		console: true,
		fs: 'empty'
	},

	resolve: {
		extensions: ['.js', '.jsx'],
		modules: [
			'src',
			'node_modules'
		]
	},

	module: {
		rules: [
			{
				test: /\.worker\.js$/,
				use: [
					{
						loader: 'worker-loader'
					}
				]
			},
			{
				test: /\.glsl$/,
				use: [
					{
						loader: 'webpack-glsl-loader'
					}
				]
			},
			{

				test: /\.(js|jsx)?$/,
				include: [path.join(__dirname, 'src')],
				exclude: /(node_modules)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['es2015', 'stage-0', 'react', 'flow'],
							cacheDirectory: '_babel_cache'
						}
					}
				]
			},
			{
				test: /\.scss$/,
				exclude: '/node_modules/',
				use: ExtractTextPlugin.extract({
					fallback: [
						{
							loader: 'style-loader'
						}
					],
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true,
								includePaths: [path.resolve('./src/js/client/components')],
								outFile: 'bla' // for internal reference only: https://github.com/sass/node-sass
							}
						},
						{
							loader: 'resolve-url-loader',
							options: {
								sourceMap: true
							}
						}
					]
				})
			},
			{
				test: /\.(png|jpg|jpeg|otf|eot|svg|ttf|ico|woff|woff2)(\?.*)?$/,
				use: [
					{
						loader: 'file-loader?name=assets/[name].[ext]'
					}
				]
			}
		]
	},

	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(true),
		new ExtractTextPlugin({
			filename: '[name].css',
			allChunks: true
		})
	]
};

module.exports = config;
