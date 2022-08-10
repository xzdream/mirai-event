const qv = require("../../utils/qv");
const moment = require("../../utils/moment");
const app = getApp();

Page({
    data: {
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host,
        guildId: null,
        pricing: null
    },
    onBackBtnClicked: function() {
        wx.navigateBack();
    },
    onLoad: function(options) {
        let guildId = options.id || options.scene;
        this.setData({ guildId: guildId });
        this.loadPricing(guildId);
    },
    loadPricing: function(guildId) {
        let self = this;
        qv.get(this.data.host + '/api/guild/' + guildId + '/price').then(result => {
            for (let i = 0; i < result.data.data.length; ++i) {
                result.data.data[i].createdAt = moment(result.data.data[i].createdAt).format("YYYY年MM月DD日");
            }
            self.setData({ pricing: result.data.data });
        });
    },
    navigateToPricing: function(event) {
        let pricingId = event.currentTarget.dataset.id;
        wx.navigateTo({
          url: 'pricing-detail?id=' + pricingId + '&guild=' + this.data.guildId,
        });
    },
    onBackToHomeBtnClicked: function() {
        wx.redirectTo({
          url: '../index?redirect=no',
        });
    },
    onShareAppMessage: function () {
        return {
            title: '价目表'
        };
    },
    onShareTimeline: function() {
        return {
            title: '价目表'
        }
    }
})
