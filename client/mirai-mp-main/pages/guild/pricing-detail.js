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
        let guildId = options.guild;
        let pricingId = options.id;
        this.setData({ guildId: guildId });
        this.loadPricing(guildId, pricingId);
    },
    loadPricing: function(guildId, pricingId) {
        let self = this;
        qv.get(this.data.host + '/api/guild/' + guildId + '/price/' + pricingId).then(result => {
            let pricing = result.data.data;
            pricing.data = JSON.parse(pricing.data);
            for (let i = 0; i < pricing.data.length; ++i) {
                let group = pricing.data[i];
                for (let j = 0; j < group.items.length; ++j) {
                    switch(group.items[j].quality) {
                        case 5: 
                            group.items[j]._css = 'orange';
                            break;
                        case 4: 
                            group.items[j]._css = 'purple';
                            break;
                        case 3: 
                            group.items[j]._css = 'blue';
                            break;
                        case 2:
                            group.items[j]._css = 'green';
                            break;
                        case 1:
                            group.items[j]._css = 'white';
                            break;
                        case 0:
                            group.items[j]._css = 'gray';
                            break;
                    }
                }
            }
            self.setData({ pricing: pricing });
        });
    },
    onShareAppMessage: function () {
        return {
            title: this.data.pricing.name
        };
    },
    onShareTimeline: function() {
        return {
            title: this.data.pricing.name
        }
    }
})
