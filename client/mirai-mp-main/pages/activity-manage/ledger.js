const qv = require("../../utils/qv");
const moment = require("../../utils/moment");

Component({
    properties: {
        activity: null,
        permission: null
    },
    data: {
        activity: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        ledgerString: ''
    },
    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                    url: 'activity?id=' + this.properties.activity.id
                });
            });
        },
        importLedger: function() {
            if (!this.data.ledgerString) {
                wx.showModal({
                    showCancel: false,
                    title: '错误',
                    content: '请粘贴账本字符串'
                })
                return;
            }

            wx.showLoading({
              title: '正在导入',
            });
            let self = this;
            qv.post(this.data.host + '/api/util/ledger', { string: this.data.ledgerString }).then(parseResult => {
                console.log(JSON.stringify(parseResult.data));
                return qv.put(self.data.host + '/api/activity/' + this.data.activity.id, { extension3: JSON.stringify(parseResult.data) });
            }).then(result => {
                wx.hideLoading({});
                wx.showToast({
                  title: '上传完毕',
                });
                if (wx.$activity) {
                    wx.$activity.onLoad({ id: self.data.activity.id });
                }
                self.onBackBtnClicked();
            });
        }
    },
    lifetimes: {
        attached: function () {
            let activity = this.properties.activity;
            this.setData({ activity: activity });
        }
    }
})
