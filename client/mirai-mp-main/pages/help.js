const app = getApp();

Page({
    data: {
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host
    },
    onBackBtnClicked: function() {
        wx.navigateBack();
    },
    onLoad: function(options) {
    },
})
