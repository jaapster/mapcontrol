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
							presets: [
								'@babel/flow',
								[
									"@babel/preset-env",
									{
										"targets": {
											"browsers": [
												"last 2 versions"
											]
										}
									}
								]
							],
							plugins: [
								"@babel/plugin-syntax-dynamic-import",
								[
									"@babel/plugin-proposal-decorators",
									{
										"legacy": true
									}
								],
								[
									"@babel/plugin-proposal-pipeline-operator",
									{
										"proposal": "minimal"
									}
								],
								"@babel/plugin-proposal-class-properties",
								"@babel/plugin-proposal-optional-chaining",
								"@babel/plugin-proposal-nullish-coalescing-operator"
							]
						}
					}
				]
			}
		]
	}
};
