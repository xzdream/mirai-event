// pages/index.js

const app = getApp();
const qv = require("../utils/qv");

Page({
    data: {
        id: null,
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host,
        active: null,
        layoutVariables: {
        },
        activity: null,
        loaded: false,
        permission: {
        }
    },
    onLoad: function(options) {
        try
        {
            this.setData({
                id: options.id || options.scene
            });
            wx.$ledger = this;
            this.loadActivity();
            this.switchTab2('basic');
        }
        catch(e) 
        {
            wx.showToast({
              title: '加载数据时发生错误',
              icon: null
            });
            wx.redirectTo({
              url: 'index',
            });
        }
    },
    onUnload: function() {
        wx.$ledger = null;
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
    loadActivity: function() {
        if (wx.$activity && wx.$activity.data.activity.id == this.data.id) {
            wx.$guildId = wx.$activity.data.activity.guildId;
            this.getGuildPermissions();
            this.setData({
                activity: wx.$activity.data.activity,
                loaded: true,
                canBack: !!wx.$guild
            });
            return Promise.resolve(null);
        }

        this.setData({ loaded: false });
        wx.showLoading({
          title: '正在加载活动...',
        })
        let self = this;
        return qv.get(`${this.data.host}/api/activity/${this.data.id}`).then(result => {
            let activity = result.data.data;
            wx.$guildId = activity.guildId;
            self.getGuildPermissions();
            wx.setNavigationBarTitle({
              title: activity.name,
            });

            self.setData({ 
                activity: activity,
                loaded: true,
                canBack: !!wx.$guild
            });
            wx.hideLoading({});
        });
    },
    getGuildPermissions: function() {
        let self = this;
        qv.requestWithCredential(this.data.host + '/api/user/permission', 'GET').then(result => {
            self.setData({ permission: result.data.data });
            if (!result.data.data.guildManager) {
                wx.redirectTo({
                  url: 'index',
                })
            }
        });
    }
})