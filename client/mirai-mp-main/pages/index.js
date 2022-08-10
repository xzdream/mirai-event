const qv = require("../utils/qv");
const app = getApp();

Page({
    data: {
        host: app.globalData.host,
        isFullScreen: app.globalData.isFullScreen,
        active: 'home',
        layoutVariables: {
            characterSearch: {
                name: '',
                realm: ''
            }
        }
    },
    onLoad: function(options) {
        wx.$root = this;
        let defaultGuild = wx.getStorageSync('defaultGuild');
        if (defaultGuild && (!options.redirect || options.redirect != 'no')) {
            this.navigateToGuild(defaultGuild);
        }
    },
    switchTab: function(event) {
        let active = event.currentTarget.dataset.active;
        this.switchTab2(active);
    },
    switchTab2: function(active) {
        this.setData({
            active: active
        });
    },
    switchToCharacterDetail: function(name, realm) {
        this.setData({
            "layoutVariables.characterSearch.name": name,
            "layoutVariables.characterSearch.realm": realm,
            active: 'ch-res'
        });
    },
    navigateToGuild: function(guildId) {
        wx.navigateTo({
          url: `guild?id=${guildId}`,
        })
    },
    navigateToMy: function() {
        wx.navigateTo({
          url: 'my',
        })
    },
    scanQrCode: function() {
        let self = this;
        wx.scanCode({
            success: function(res) {
                if (res.result) {
                    qv.requestWithCredential(self.data.host + '/api/scan/scan', 'POST', { code: res.result });
                    wx.showToast({
                      title: '登录成功',
                    });
                }
            }
        })
    },
    onShareAppMessage: function () {

    }
})