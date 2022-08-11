const qv = require("../../utils/qv");

Component({
    properties: {
        guild: null
    },

    data: {
        guild: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        defaultGuild: null,
        guildPermission: {},
        nickname: null,
        userId: null
    },

    methods: {
        onSetBtnClicked: function() {
            wx.setStorageSync('defaultGuild', this.data.guild.id);
            var self = this;
            wx.showModal({
                title: "完成",
                content: `已将${this.data.guild.name}设置为默认公会`,
                showCancel: false
            }).then(() => {
                self.setData({
                    defaultGuild: self.data.guild.id
                });
            });
        },
        onUnsetBtnClicked: function() {
            wx.removeStorageSync('defaultGuild');
            wx.showModal({
                title: "完成",
                content: `已取消${this.data.guild.name}默认公会`,
                showCancel: false
            }).then(() => {
                wx.$guildId = null;
                wx.navigateBack();
            });
        },
        onCreateActivityClicked: function() {
            wx.navigateTo({
              url: 'guild/create-activity?id=' + this.data.guild.id,
            });
        },
        patchDisplayName: function() {
            let self = this;
            qv.post(this.data.host + '/api/user/' + getApp().globalData.session.username + '/displayName', {
                displayName: this.data.nickname
            }).then(() => {
                getApp().globalData.session.displayName = this.data.nickname;
                wx.showToast({
                    title: '修改成功',
                })
            });
        },
        onManagerManagementClicked: function() {
            wx.navigateTo({
              url: 'guild/manager?id=' + this.data.guild.id,
            });
        },
        onRegisterPolicyClicked: function() {
            wx.navigateTo({
              url: 'guild/reg-policy?id=' + this.data.guild.id,
            });
        },
        onBackBtnClicked: function() {
            wx.redirectTo({
              url: 'index?redirect=no',
            })
        },
        onAskForHelpBtnClicked: function() {
            wx.navigateTo({
              url: 'help',
            });
        },
        onNavigateToHomeBtnClicked: function() {
            wx.redirectTo({
              url: 'index?redirect=no',
            });
        }
    },

    lifetimes: {
        attached: function() {
            this.setData({ 
                guild: this.properties.guild,
                defaultGuild: wx.getStorageSync('defaultGuild'),
                guildPermission: !wx.$guild ? {} : wx.$guild.data.permission,
                nickname: getApp().globalData.session.displayName,
                userId: getApp().globalData.session.username,
                website: 'https://' + this.properties.guild.id + '.173qu.com'
            });
        }
    }
})
