var processEnv = process.argv[2]; // 'build','dev'

/**
 * Config
 */
const config = {
  outputRoot: './dist/',
  srcRoot: './src/',
};





/**
 * webpack build.js
 * created by xingo 2017/02/16
 */
var path = require('path')

var webpack = require('webpack');
var assetsPath = path.resolve(__dirname, config.outputRoot);
var srcPath = path.resolve(__dirname, config.srcRoot);
var HtmlWebpackPlugin = require('html-webpack-plugin');

var webpackConfig = {
  entry: processEnv == 'dev' ? {
    'index': path.resolve(srcPath, 'index.js'),
  } : {
    'canvas-contribution': path.resolve(srcPath, './main.js'),
  },
  output: {
    filename: '[name].[chunkhash:3].js',
    chunkFilename: '[name].[chunkhash:3].js',
    publicPath: processEnv == 'dev' ? '/' : undefined,
    path: assetsPath,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          "presets": [
            ["es2015", {
              "modules": false
            }]
          ]
        }
      },
    ]
  },
  resolve: {
    alias: {
    }
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comments: false,
      sourceMap: (processEnv == 'dev')
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: (processEnv == 'dev') ? JSON.stringify('development') : JSON.stringify('production'),
      }
    }),
  ],
  devtool: (processEnv == 'dev') ? 'source-map' : false,
};

if (processEnv == 'dev') {
  webpackConfig.plugins.push(new HtmlWebpackPlugin({
    template: path.resolve(srcPath, './index.html'),
    inject: true,
    filename: 'index.html',
    minify: false
  }));
  var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
  webpackConfig.plugins.push(new BrowserSyncPlugin({
    host: 'localhost',
    port: 3000,
    server: {
      baseDir: [assetsPath]
    }
  }));
  webpackConfig.watch = true;
  webpackConfig.watchOptions = {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /(node_modules|dist)/
  }
  compile(webpackConfig);
} else {
  webpackConfig.module.rules.push({
    test: path.resolve(srcPath, './main.js'),
    exclude: /node_modules/,
    use: 'imports-loader?define=>false',
  });
  compile(webpackConfig);
}



function compile(webpackConfig) {
  var ora = require('ora');
  var spinner = ora('building for production...');
  spinner.start();

  require('shelljs/global');
  rm('-rf', assetsPath);
  mkdir('-p', assetsPath);
  return webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n')
  });
}