const qv = require("../../utils/qv");
const moment = require("../../utils/moment");

Component({
    properties: {
        activity: null,
        permission: null
    },
    data: {
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        confirm: ''
    },
    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                    url: 'activity?id=' + this.properties.activity.id
                });
            });
        },
        updateWcl: function() {
            wx.showToast({
              title: '已提交同步',
            })
            qv.post(this.data.host + '/api/charactor/batch', {
                realm: this.data.activity.realm,
                names: this.data.activity.registrations.map(x => x.name)
            });
        }
    },
    lifetimes: {
        attached: function () {
            let activity = this.properties.activity;
            this.setData({});
        }
    }
})
