const qv = require("../../utils/qv");
const moment = require("../../utils/moment");
const app = getApp();

Page({
    data: {
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host,
        activityId: null
    },
    onBackBtnClicked: function() {
        wx.navigateBack();
    },
    onLoad: function(options) {
        this.setData({ activityId: options.activity });
        this.loadMyGuilds();
    },
    loadMyGuilds: function() {
        let self = this;
        qv.get(this.data.host + '/api/guild/my').then(result => {
            let guilds = result.data.data;
            self.setData({
                myGuilds: guilds
            });
        });
    },
    onGuildClicked: function(event) {
        let guildId = event.currentTarget.dataset.id;
        let self = this;
        wx.showModal({
            title: '分享活动',
            content: '你确定要将活动分享至该公会吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: function(res) {
                if (res) {
                    qv.post(self.data.host + '/api/util/forward-activity', {
                        activityId: self.data.activityId,
                        guildId: guildId
                    }).then(result => {
                        wx.navigateTo({
                          url: '/pages/guild?id=' + guildId,
                        });
                    });
                }
            }
        });
    }
})
