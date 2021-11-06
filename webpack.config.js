const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    module: {
        rules: [
            {
                test: /\.vue$/i,
                exclude: /node_modules/,
                loader: "vue-loader",
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: ["style-loader", "css-loader"],
            }
        ],
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "node_modules"),
        ],
        extensions: [".js", ".vue"],
        alias: {
            "vue$": "vue/dist/vue.esm.js",
        },
    },
    // devtool: "inline-source-map",
    target: "web",
    plugins: [
        new VueLoaderPlugin(),
    ],
    mode: 'production',
};