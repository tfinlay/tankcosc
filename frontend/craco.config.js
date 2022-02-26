var HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin

module.exports = {
    webpack: {
        configure: (config, {env, paths }) => {
            console.log(paths)

            config.entry = {
                main: config.entry,
                playground_executor_worker: paths.appSrc + "/playground_executor_worker.js"
            }
            config.output.filename = "static/js/[name].js"

            config.plugins.push(new HtmlWebpackSkipAssetsPlugin({
            excludeAssets: [/.*playground_executor_worker.*/]
            }))

            console.log(config)
            return config
        }
    }
}