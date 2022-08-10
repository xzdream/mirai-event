const qv = require("../../utils/qv");

Page({
    data: {
        guildId: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        guild: null,
        policy: null
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

        this.loadGuild(options.id);
        
        this.getGuildPermissions();
    },
    getGuildPermissions: function() {
        let self = this;
        qv.requestWithCredential(this.data.host + '/api/user/permission', 'GET').then(result => {
            self.setData({ permission: result.data.data });
            if (!result.data.data.guildManager) {
                wx.redirectTo({
                  url: '../index',
                });
            }
        });
    },
    onBackBtnClicked: function () {
        wx.navigateBack().catch(() => {
            wx.redirectTo({
              url: 'guild?id=' + this.data.guildId
            });
        });
    },
    loadGuild: function(guildId) {
        let self = this;
        wx.showLoading({
          title: '正在加载信息...',
        });
        return qv.get(`${this.data.host}/api/guild/${guildId}`).then(result => {
            let guild = result.data.data;
            wx.setNavigationBarTitle({
                title: guild.name,
            })
            self.setData({ guild: guild, policy: guild.registerPolicy });
            wx.hideLoading({});
        });
    },
    onPolicyOptionClicked: function(event) {
        let policy = event.currentTarget.dataset.policy;
        this.setData({ policy: policy });
    },
    onSaveBtnClicked: function() {
        wx.showLoading({
          title: '正在保存...',
        });
        qv.put(this.data.host + '/api/guild/' + this.data.guildId + '/reg-policy', {
            registerPolicy: this.data.policy
        }).then(result => {
            wx.hideLoading({});
            wx.showToast({
              title: '保存成功',
            });
        });
    }
})
