const { defineConfig } = require('@vue/cli-service');
module.exports = {
    lintOnSave: false,
    transpileDependencies: ['axios'],
    chainWebpack: config => {
      config.module
        .rule("js")
        .include.add(/node_modules[\\/]axios/);
    }
};
