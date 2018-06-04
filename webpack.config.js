const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: {
		main: [
			'@babel/polyfill',
			'./src/js/client/index.js',
			'./src/scss/index.scss'
		]
	},

	mode: 'development',

	devtool: '#source-map',

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
		sourceMapFilename: '[file].source.map'
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
				use: [{ loader: 'worker-loader' }]
			},
			{
				test: /\.glsl$/,
				use: [{ loader: 'webpack-glsl-loader' }]
			},
			{

				test: /\.(js|jsx)?$/,
				include: [path.join(__dirname, 'src')],
				exclude: /(node_modules)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/react', '@babel/flow', ['@babel/stage-0', { decoratorsLegacy: true }]]
						}
					}
				]
			},
			{
				test: /\.scss$/,
				exclude: '/node_modules/',

				use: [
					MiniCssExtractPlugin.loader,
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
							includePaths: [path.resolve('./src/js/components')],
							outFile: 'bla'
						}
					}
				]
			}
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name]/[name].css',
			allChunks: true
		})
	]
};
