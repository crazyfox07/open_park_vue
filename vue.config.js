module.exports = {
  devServer: {
    port: 9010
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'jtss.rzbus.cn', // appId
        win: {
          icon: 'public/app.ico'// 设置软件图标
        },
        nsis: {
          oneClick: false, // 是否一件安装，默认目录
          perMachine: true, // 是否开启安装时权限限制（此电脑或当前用户）
          allowToChangeInstallationDirectory: true // 允许修改目录
        },
        extraResources: {
          from: './config.json',
          to: '../'
        }
      }
    }
  }
}
