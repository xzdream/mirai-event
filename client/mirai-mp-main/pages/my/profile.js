const qv = require("../../utils/qv");

Component({
    data: {
        guild: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        nickname: null,
        myGuilds: []
    },

    methods: {
        onBackBtnClicked: function() {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                  url: 'index'
                });
            });
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
            wx.navigateTo({
              url: 'guild?id=' + guildId,
            })
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
        }
    },

    lifetimes: {
        attached: function() {
            this.loadMyGuilds();
            this.setData({ 
                guild: this.properties.guild,
                defaultGuild: wx.getStorageSync('defaultGuild'),
                nickname: getApp().globalData.session.displayName
            });
        }
    }
})
