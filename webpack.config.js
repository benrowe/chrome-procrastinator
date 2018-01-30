const webpack = require('webpack');
const fileSystem = require('fs');
const path = require('path');
const env = require("./build/env");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

let alias = {
  jquery: 'jquery/jquery'
};

const secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'));

const fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

if (fileSystem.existsSync(secretsPath)) {
    alias.screts = secretsPath;
}

module.exports = {
  entry: {
    popup: path.join(__dirname, "src", "js", "popup.ts"),
    options: path.join(__dirname, "src", "js", "options.ts"),
    background: path.join(__dirname, "src", "js", "background.ts"),
    block: path.join(__dirname, "src", "js", "block.ts"),
    vendor: ['jquery']
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.join(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
        exclude: /node_modules/
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
      alias: alias,
      extensions: ['.ts', '.tsx', '.json', '.js']
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: 'js/common.js',
      chunks: ['popup',
        'options',
        'background',
      'block'],
      minChunks: function (module) {
          return module.context && module.context.indexOf("node_modules") !== -1;
      }
    }),
    // clean the build folder
    new CleanWebpackPlugin(["dist"]),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV)
    }),
    new CopyWebpackPlugin([
      {
        from: "src/manifest.json",
        transform: function (content, path) {
          // generates the manifest file using the package.json informations
          let manifest = JSON.parse(content.toString())
          manifest.version = process.env.npm_package_version;
          return Buffer.from(JSON.stringify(manifest))
        }
      },
      {from: 'src/images', to: 'images'},
      {from: 'src/css', to: 'css'}
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup.html"),
      filename: "popup.html",
      chunks: ["vendor", "common", "popup"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "options.html"),
      filename: "options.html",
      chunks: ["vendor", "common", "options"]
    }),
    new HtmlWebpackPlugin({
      filename: "background.html",
      chunks: ["common", "background"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "block.html"),
      filename: "block.html",
      chunks: ["common", "background"]
    }),
    new WriteFilePlugin()
  ]
}
