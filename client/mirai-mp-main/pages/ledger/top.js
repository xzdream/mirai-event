Component({
    properties: {
        activity: null
    },

    data: {
        activity: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        canBack: false
    },

    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                  url: 'activity?id=' + this.data.activity.id,
                })
            });
        }
    },

    lifetimes: {
        attached: function () {
            let activity = this.properties.activity;

            for (let i = 0; i < activity.ledger.income.length; ++i) {
                let row = activity.ledger.income[i];
                if (row.item) {
                    switch(row.item.quality)
                    {
                        case 0:
                            row.item._css = 'gray';
                            break;
                        case 1:
                            row.item._css = 'white';
                            break;
                        case 2:
                            row.item._css = 'green';
                            break;
                        case 3:
                            row.item._css = 'blue';
                            break;
                        case 4:
                            row.item._css = 'purple';
                            break;
                        case 5:
                            row.item._css = 'orange';
                            break;
                    }
                }

                if (row.price >= 10000) {
                    row._priceCss = 'orange';
                } else if (row.price >= 5000) {
                    row._priceCss = 'purple';
                } else if (row.price >= 1000) {
                    row._priceCss = 'blue';
                }  else if (row.price >= 500) {
                    row._priceCss = 'green';
                } else if (row.price > 0) {
                    row._priceCss = 'white';
                } else {
                    row._priceCss = 'gray';
                }
            }

            activity.ledger.income.sort((a, b) => b.price - a.price);

            this.setData({
                activity: activity,
                canBack: !!wx.$activity
            });
        }
    }
})
