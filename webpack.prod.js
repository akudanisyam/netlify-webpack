console.log('Webpack production build starting...');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const createWebpackConfig = require('./nw-core');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { entry, htmlPlugins } = createWebpackConfig({
    baseDirPages: './src/pages',
    jsExtensions: ['.js'],
    htmlExtensions: ['.html']
});

const apiEntry = glob.sync('./functions/**/*.js').reduce((acc, file) => {
  const name = path.basename(file, '.js');
  acc[`functions/${name}`] = './' + file;
  return acc;
}, {});

module.exports = {
    mode: 'production',
    entry: {
        ...entry,
        ...apiEntry
    },
    output: {
        filename: (pathData) => {
            return pathData.chunk.name.startsWith('functions/') 
                ? '[name].js' 
                : 'js/[name].[contenthash].bundle.js';
        },
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ],
        splitChunks: {
            chunks: 'all',
        },
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
            protectWebpackAssets: false,
        }),
        ...htmlPlugins,
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'netlify.toml', to: '' }
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name].[hash][ext]',
                },
            },
        ],
    },
};