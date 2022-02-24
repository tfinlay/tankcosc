const WorkerPlugin = require("worker-plugin");

module.exports = function override(config, env) {
    config.plugins = [
        new WorkerPlugin(),
        ...config.plugins
    ];
    return config;
}