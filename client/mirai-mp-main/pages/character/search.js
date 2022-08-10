const app = getApp();

Component({
    properties: {
        realm: null
    },
    data: {
        isFullScreen: app.globalData.isFullScreen,
        realm: '',
        characterName: ''
    },
    methods: {
        onSearchBtnClicked: function() {
            if (!this.data.characterName) {
                wx.showModal({
                    title: "错误",
                    content: "请填写角色名",
                    showCancel: false
                })
                return;
            }

            if (!this.data.realm) {
                wx.showModal({
                    title: "错误",
                    content: "请填写服务器名称",
                    showCancel: false
                });
                return;
            }

            wx.navigateTo({
              url: 'character/detail?name=' + this.data.characterName + '&realm=' + this.data.realm,
            })
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
                realm: this.properties.realm || ''
            });
        }
    }
})
