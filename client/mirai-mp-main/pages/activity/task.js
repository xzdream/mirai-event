Component({
    properties: {
        activity: null
    },

    data: {
        activity: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        canBack: false,
        groups: []
    },

    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                  url: 'guild?id=' + this.data.activity.guildId,
                })
            });
        }
    },

    lifetimes: {
        attached: function () {
            let activity = this.properties.activity;

            this.setData({
                activity: activity,
                canBack: !!wx.$guild
            });
        }
    }
})
