import path from 'path'
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import 'webpack-dev-server';
import WebpackObfuscator from 'webpack-obfuscator'


interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

export const isProduction = process.env.NODE_ENV === 'production'

const config: Configuration = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(process.cwd(), 'public'),
    publicPath: '/'
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.resolve(process.cwd(), 'public')],
      verbose: true
    }),
    new HtmlWebpackPlugin({
      //favicon: './src/assets/favicon.ico',
      template: './src/assets/index.html',
      title: 'Robot'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './static' }
      ]
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' },
          { loader: 'ts-loader' }
        ]
      },
      {
        test: /\.(glb|gltf|png|jpe?g)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.glsl$/i,
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ]
      }
    ],
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    https: true
  }
}

if (isProduction) {
  const obfuscator = new WebpackObfuscator({
    disableConsoleOutput: true,
    debugProtection: true,
    debugProtectionInterval: true,
    rotateStringArray: true,
    transformObjectKeys: true
  })
  config.plugins?.push(obfuscator)
}

export default config
