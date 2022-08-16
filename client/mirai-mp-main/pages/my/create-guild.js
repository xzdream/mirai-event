const qv = require("../../utils/qv");

Component({
    data: {
        guild: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        name: null,
        domain: null,
        realm: null,
        faction: null
    },

    methods: {
        onBackBtnClicked: function() {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                  url: 'index'
                });
            });
        },
        onFactionClicked: function(event) {
            let faction = event.currentTarget.dataset.faction;
            this.setData({
                faction: faction
            });
        },
        createGuild: function() {
          console.log(this.data)
            if (!this.data.name) {
                wx.showModal({
                    title: "错误",
                    // content: "请填写公会名称",
                    content: "请填写金团名称",
                    showCancel: false
                });
                return;
            }

            if (!this.data.domain || !/^[0-9a-zA-Z-_]{4,16}$/.test(this.data.domain)) {
                wx.showModal({
                    title: "错误",
                    content: "简称不合法，请输入4-16个英文字母或数字",
                    showCancel: false
                });
                return;
            }
            
            if (!this.data.realm) {
                wx.showModal({
                    title: "错误",
                    content: "请填写金团所在服务器名称",
                    showCancel: false
                });
                return;
            }
            
            if (!this.data.faction) {
                wx.showModal({
                    title: "错误",
                    content: "请选择阵营",
                    showCancel: false
                });
                return;
            }

            wx.showLoading({
              // title: '正在创建公会',
              title: '正在创建金团',
            });

            let self = this;
            qv.post(this.data.host + '/api/guild', {
                id: this.data.domain,
                name: this.data.name,
                realm: this.data.realm,
                faction: this.data.faction
            }).then(result => {
                wx.hideLoading({});
                if (result.data.code == 200) {
                    self.setData({
                        name: null,
                        faction: null,
                        realm: null,
                        domain: null
                    });

                    wx.navigateTo({
                      url: 'guild?id=' + result.data.data.id,
                    });
                } else {
                    wx.showModal({
                        title: "错误",
                        content: result.data.message,
                        showCancel: false
                    });
                }
            });
        }
    },

    lifetimes: {
        attached: function() {
            this.setData({ 
                guild: this.properties.guild,
                defaultGuild: wx.getStorageSync('defaultGuild'),
                nickname: getApp().globalData.session.displayName
            });
        }
    }
})
