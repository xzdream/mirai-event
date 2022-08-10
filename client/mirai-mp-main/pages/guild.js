// pages/index.js

const app = getApp();
const qv = require("../utils/qv");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: null,
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host,
        guild: null,
        active: null,
        layoutVariables: {
        },
        permission: {
            guildManager: false,
            guildOwner: false
        }
    },
    onLoad: function(options) {
        let guildId = options.id || options.scene;
        this.setData({
            id: guildId
        });
        wx.$guild = this;
        wx.$guildId = guildId;
        this.loadGuild().catch(err => {
            wx.showToast({
                title: '加载数据时发生错误',
                icon: null
            });
            wx.redirectTo({
                url: 'index',
            });
        });
        this.switchTab2('home');
    },
    onUnload: function() {

    },
    onShow: function() {
        if (this.data.id) {
            wx.$guildId = this.data.id;
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
    loadGuild: function() {
        let self = this;
        return qv.get(`${this.data.host}/api/guild/${this.data.id}`).then(result => {
            let guild = result.data.data;
            wx.setNavigationBarTitle({
                title: guild.name,
            })
            self.setData({ guild: guild });
            return self.getGuildPermissions();
        });
    },
    getGuildPermissions: function() {
        let self = this;
        qv.requestWithCredential(this.data.host + '/api/user/permission', 'GET').then(result => {
            self.setData({ permission: result.data.data });
        });
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
    showPricing: function() {
        wx.navigateTo({
          url: 'guild/pricing?id=' + this.data.id,
        })
    },
    onShareAppMessage: function () {
        return {
            title: '【公会活动】' + this.data.guild.name
        };
    }
})