const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

fs.rmSync(path.resolve(__dirname, "dist"), { recursive: true, force: true });
fs.mkdirSync(path.resolve(__dirname, "dist"));

/** @type {webpack.Configuration} */
const config = {
	mode: "production",
	entry: "./index.ts",
	target: "node",
	devtool: false,
	output: {
		path: path.resolve(__dirname, "dist"),
		library: {
			commonjs: "csv-query-stream",
			amd: "csv-query-stream",
			root: "CSVQUERYSTREAM",
		},
		libraryTarget: "umd",
		umdNamedDefine: true,
		globalObject: `(typeof self !== 'undefined' ? self : this)`,
		filename: "index.js",
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, "package.json"),
					to: path.resolve(__dirname, "dist/package.json"),
					transform(content) {
						const packageJson = JSON.parse(content.toString());
						packageJson.main = "index.js";
						packageJson.types = "index.d.ts";
						delete packageJson.devDependencies;
						delete packageJson.prepublishOnly;
						delete packageJson.scripts;
						return JSON.stringify(packageJson, null, 2);
					},
				},
				{
					from: path.resolve(__dirname, "README.md"),
					to: path.resolve(__dirname, "dist/README.md"),
				},
				{
					from: path.resolve(__dirname, "LICENSE"),
					to: path.resolve(__dirname, "dist/LICENSE"),
				},
				{
					from: path.resolve(__dirname, "index.d.ts"),
					to: path.resolve(__dirname, "dist/index.d.ts"),
				},
			],
		}),
	],
	optimization: {
		minimize: true,
		nodeEnv: false,
	},
	node: {
		global: false,
		__dirname: false,
		__filename: false,
	},
	module: {
		rules: [
			{
				test: /\.ts$/i,
				loader: "ts-loader",
				exclude: ["/node_modules/"],
			},
		],
	},
	externalsPresets: { node: true },
	resolve: {
		extensions: [".ts", ".js"],
	},
};

module.exports = config;
