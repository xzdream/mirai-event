// pages/index.js

const app = getApp();
const qv = require("../utils/qv");

Page({
    data: {
        id: null,
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host,
        active: null,
        layoutVariables: {
        },
        activity: null,
        loaded: false
    },
    onLoad: function(options) {
        this.setData({
            id: options.id || options.scene
        });
        wx.$ledger = this;
        this.loadActivity().catch(err => {
            wx.showToast({
                title: '加载数据时发生错误',
                icon: null
            });
            wx.redirectTo({
                url: 'index',
            });
        });
        this.switchTab2('summary');
    },
    onUnload: function() {
        wx.$ledger = null;
    },
    switchTab: function(event) {
        let active = event.currentTarget.dataset.active;
        this.switchTab2(active);
    },
    switchTab2: function(active) {
        this.setData({
            active: active
        });
    },
    handleActivity: function(activity) {
        try {
            activity.ledger = JSON.parse(activity.extension3);
        } catch(e) {
            activity.ledger = { };
        }

        if (!activity.ledger.statistics) {
            activity.ledger.statistics = {};
        }

        for (let i = 0; i < activity.ledger.income.length; ++i) {
            let reg = activity.registrations.filter(x => x.name == activity.ledger.income[i].player);
            if (reg.length) {
                reg = reg[0];
                activity.ledger.income[i]._player = reg;
            }
        }

        for (let i = 0; i < activity.ledger.other.length; ++i) {
            let reg = activity.registrations.filter(x => x.name == activity.ledger.other[i].player);
            if (reg.length) {
                reg = reg[0];
                activity.ledger.other[i]._player = reg;
            }
        }

        for (let i = 0; i < activity.ledger.expense.length; ++i) {
            let reg = activity.registrations.filter(x => x.name == activity.ledger.expense[i].player);
            if (reg.length) {
                reg = reg[0];
                activity.ledger.expense[i]._player = reg;
            }
        }

        if (activity.ledger.statistics && activity.ledger.statistics.categories) {
            for (let i = 0; i < activity.ledger.statistics.categories.length; ++i) {
                let category = activity.ledger.statistics.categories[i];
                for (let j = 0; j < category.details.length; ++j) {
                    let reg = activity.registrations.filter(x => x.name == category.details[j].player);
                    if (reg.length) {
                        reg = reg[0];
                        category.details[j]._player = reg;
                    }
                }
            }
        }

        activity.ledger.statistics.topConsumers = this.generateTopConsumers(activity.ledger, activity);
        if (!activity.ledger.statistics.summary || !activity.ledger.statistics.summary.per)
            activity.ledger.statistics.summary = this.generateLedgerSumamry(activity.ledger);
    },
    generateTopConsumers: function (ledger, activity) {
        if (!ledger.income) {
            return null;
        }
        
        var ret = [];
        var tmp = {};
        for (var i = 0; i < ledger.income.length; ++i) {
            if (!ledger.income[i].player || ledger.income[i].player == '-') {
                continue;
            }

            var player = ledger.income[i].player;
            if (!tmp[player]) {
                tmp[player] = 0;
            }

            tmp[player] += ledger.income[i].price;
        }

        var keys = Object.getOwnPropertyNames(tmp);
        for (var i = 0; i < keys.length; ++i) {
            let reg = activity.registrations.filter(x => x.name == keys[i]);
            let _player = null;
            if (reg.length) {
                _player = reg[0];
            }
            ret.push({ 
                player: keys[i], 
                class: ledger.income.filter(x => x.player == keys[i])[0].class,
                price: tmp[keys[i]], 
                _player: _player, 
                _priceCss: this.getPriceCss(tmp[keys[i]]) 
            });
        }

        ret.sort((a, b) => b.price - a.price);
        return ret;
    },
    generateLedgerSumamry: function (ledger) {
        if (!ledger.income) {
            return null;
        }

        var ret = {
            total: 0,
            expense: 0,
            profit: 0,
            split: 0,
            per: 0
        };

        for (var i = 0; i < ledger.income.length; ++i) {
            ret.total += ledger.income[i].price;
        }

        for (var i = 0; i < ledger.other.length; ++i) {
            ret.total += ledger.other[i].price;
        }

        for (var i = 0; i < ledger.expense.length; ++i) {
            ret.expense += ledger.expense[i].price;
        }

        ret.profit = ret.total - ret.expense;

        if (ledger.statistics && ledger.statistics.split) {
            ret.split = ledger.statistics.split;
            ret.per = parseInt(ret.profit / ret.split);
        }

        return ret;
    },
    getPriceCss: function(price) {
        if (price >= 10000) {
            return 'orange';
        } else if (price >= 5000) {
            return 'purple';
        } else if (price >= 1000) {
            return 'blue';
        } else if (price > 0) {
            return 'white';
        } else {
            return 'gray';
        }
    },
    loadActivity: function() {
        if (wx.$activity && wx.$activity.data.activity.id == this.data.id) {
            this.handleActivity(wx.$activity.data.activity);
            this.setData({
                activity: wx.$activity.data.activity,
                loaded: true,
                canBack: !!wx.$guild
            });
            return Promise.resolve(null);
        }

        this.setData({ loaded: false });
        wx.showLoading({
          title: '正在加载活动...',
        })
        let self = this;
        return qv.get(`${this.data.host}/api/activity/${this.data.id}`).then(result => {
            let activity = result.data.data;
            wx.setNavigationBarTitle({
              title: activity.name,
            })

            this.handleActivity(activity);
            self.setData({ 
                activity: activity,
                loaded: true,
                canBack: !!wx.$guild
            });
            wx.hideLoading({});
        });
    },
    onShareAppMessage: function () {
        return {
            title: '【账本】' + this.data.activity.name
        };
    },
    onShareTimeline: function() {
        return {
            title: this.data.activity.name
        }
    }
})