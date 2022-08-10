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
        deleteActivity: function() {
            if (this.data.confirm != '我确定') {
                wx.showModal({
                    title: '错误',
                    content: '请在编辑框中输入“我确定”',
                    showCancel: false
                });
                return;
            }

            wx.showLoading({
              title: '正在删除...',
            });
            qv.delete(this.data.host + '/api/activity/' + this.properties.activity.id).then(result => {
                wx.hideLoading({});
                if (result.data.code == 200) {
                    wx.showToast({
                      title: '删除成功',
                    });
                    wx.redirectTo({
                      url: 'guild?id=' + this.properties.activity.guildId,
                    });
                } else {
                    wx.showModal({
                        title: '错误',
                        content: result.data.message,
                        showCancel: false
                    });
                }
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
