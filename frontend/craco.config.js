module.exports = {
    webpack: {
        configure: (config, {env, paths }) => {
            console.log(paths)

            config.entry = {
                main: config.entry,
                playground_worker: paths.appSrc + "/playground_executor_worker.js"
            }
            config.output.filename = "static/js/[name].js"
            console.log(config)
            return config
        }
    }
}