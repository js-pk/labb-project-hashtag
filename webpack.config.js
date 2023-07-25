module.exports = {
    entry: {
        game01: "/src/javascripts/games/01.js",
        game02: "/src/javascripts/games/02.js",
        game03: "/src/javascripts/games/03.js",
        common: "/src/javascripts/utils/common.js",
    },
    output: {
        filename: 'scripts/[name].js',
        path: __dirname + '/public/'
    },
    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             exclude: /node_modules/,
    //             use: [],
    //         }, {
    //             test: /\.s[ac]ss$/i,
    //             use: [
    //                 {
    //                     loader: "file-loader",
    //                     options: {
    //                         outputPath: '/styles/',
    //                         name: '[name].min.css'
    //                     }
    //                 },
    //                 {
    //                     loader: "sass-loader",
    //                     options: {
    //                         implementation: require("sass"), // Prefer `dart-sass`
    //                     }
    //                 }
    //             ],
    //             exclude: /node_modules/
    //         },
    //     ],
    // },
    optimization: {
        splitChunks: {
            chunks: 'all',
        }
    }
};