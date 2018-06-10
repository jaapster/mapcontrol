const path = require('path');

module.exports = {
	entry: {
		main: [
			'@babel/polyfill',
			'./src/js/client/index.js'
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
		extensions: ['.js'],
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

				test: /\.(js)?$/,
				include: [path.join(__dirname, 'src')],
				exclude: /(node_modules)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/flow', ['@babel/stage-0', { decoratorsLegacy: true }]]
						}
					}
				]
			}
		]
	}
};
