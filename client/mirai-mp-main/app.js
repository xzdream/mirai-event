const qv = require("utils/qv");
const host = 'https://www.173qu.com';

App({
  onLaunch() {
    // 强制更新
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新检测',
          content: '检测到新版本，是否重启小程序？',
          success: function (res) {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        });
      });
      updateManager.onUpdateFailed(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本下载失败',
          showCancel: false
        });
      })
    })

    // 设置全面屏UI
    let self = this;
    wx.getSystemInfo({
      success: (result) => {
        console.log(result);
        if (result.statusBarHeight > 20) {
          self.globalData.isFullScreen = true;
        }
        if (result.windowWidth < 400) {
          self.globalData.shortWidth = true;
        }
      },
    });  
    // 登录
    wx.login({
      success: function(res) {
        self.loginToMirai(res.code, '');
      }
    });
  },
  loginToMirai: function(code, displayName) {
    let self = this;
    return qv.post(host + '/api/openid/session', { jsCode: code, displayName: displayName }).then(result => {
      self.globalData.session = result.data.data;
      wx.$token = self.globalData.session.token;
      self.globalData.launched = true;
    });
  },
  globalData: {
    host: host,
    isFullScreen: false,
    shortWidth: false,
    launched: false
  }
})