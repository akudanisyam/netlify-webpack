const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const createWebpackConfig = require('./nw-core.js')
const glob = require('glob')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { entry, htmlPlugins } = createWebpackConfig({
    baseDirPages: './src/pages',
    jsExtensions: ['.js'],
    htmlExtensions: ['.html']
})

const apiEntry = glob.sync('./functions/**/*.js').reduce((acc, file) => {
  const name = path.basename(file, '.js')
  acc[`functions/${name}`] = './' + file
  return acc
}, {})

module.exports = {
    mode: 'development',
    stats: {
        errorDetails: true,
    },
    entry: {
        ...entry,
        ...apiEntry
    },
    output: {
        filename: (pathData) => {
            return pathData.chunk.name.startsWith('functions/') 
                ? '[name].js' 
                : 'js/[name].bundle.js'
        },
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
    },
    plugins: [
        ...htmlPlugins,
        new MiniCssExtractPlugin({
            filename: 'css/[name].bundle.css',
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
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
}