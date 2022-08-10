const qv = require("../../utils/qv");

Page({
    data: {
        guildId: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        managers: [],
        me: null,
        username: null
    },
    onLoad: function(options) {
        if (!options.id) {
            wx.redirectTo({
              url: '../index',
            });
        }

        this.setData({
            guildId: options.id
        });
        this.getGuildPermissions();
    },
    getGuildPermissions: function() {
        let self = this;
        qv.requestWithCredential(this.data.host + '/api/user/permission', 'GET').then(result => {
            self.setData({ permission: result.data.data });
            self.loadManagers();
            if (!result.data.data.guildOwner) {
                wx.redirectTo({
                  url: '../index',
                });
            }
        });
    },
    loadManagers: function() {
        let self = this;
        qv.requestWithCredential(this.data.host + '/api/guild/mirai/manager', 'GET').then(result => {
            self.setData({
                managers: result.data.data,
                me: getApp().globalData.session.username
            });
        });
    },
    onManagerClicked: function(event) {
        let username = event.currentTarget.dataset.username;
        let self = this;

        if (username == this.data.me) {
            return;
        }

        wx.showModal({
            title: `你确定要删除吗？`,
            confirmText: '删除',
            confirmColor: 'red',
            cancelText: '取消',
            cancelColor: 'cancelColor',
            success: function(res) {
                if (!res.confirm) {
                    return;
                }

                qv.delete(self.data.host + '/api/guild/mirai/manager/' + username).then(result => {
                    if (result.data.code != 200) {
                        wx.showModal({
                            title: '错误',
                            content: result.data.message,
                            showCancel: false
                        });
                        return;
                    } 
                    
                    wx.showToast({
                      title: '删除成功',
                    });

                    self.onLoad({ id: self.data.guildId });
                });
            }
        });
    },
    onAddManagerBtnClicked: function() {
        let self = this;
        qv.put(this.data.host + '/api/guild/mirai/manager/' + this.data.username, {}).then(result => {
            wx.showToast({
              title: result.data.message
            });
            self.onLoad({ id: self.data.guildId });
        });
    },
    onBackBtnClicked: function () {
        wx.navigateBack().catch(() => {
            wx.redirectTo({
              url: 'guild?id=' + this.data.guildId
            });
        });
    }
})
