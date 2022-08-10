const app = getApp();

Page({
    data: {
        isFullScreen: app.globalData.isFullScreen,
        host: app.globalData.host,
        character: null,
        notFound: true,
        active: 'dps',
        dps: [],
        hps: [],
        items: [],
        name: null,
        realm: null,
        loading: true
    },
    loadCharacter: function(name, realm) {
        let qv = require("../../utils/qv");
        let self = this;
        return qv.get(`${this.data.host}/api/charactor/${realm}/${name}`).then(result => {
            let character = result.data.data;
            if (character == null) {
                self.setData({ notFound: true, loading: false });
            } else {
                self.setData({ notFound: false, loading: false });
                var dps = JSON.parse(character.dpsBossRanks);
                var hps = JSON.parse(character.hpsBossRanks);
                for (let i = 0; i < dps.length; ++i) {
                    self.handleBoss(dps[i]);
                }
                for (let i = 0; i < hps.length; ++i) {
                    self.handleBoss(hps[i]);
                }

                self.setData({ 
                    character: character, 
                    dps: dps,
                    hps: hps
                });

                self.loadItems(character.equipments);
            }
        });
    },
    loadItems: function(equipmentsStr) {
        let qv = require("../../utils/qv");
        let body = { queries: [{
            group: 0, ids: equipmentsStr.split(',').filter(x => x)
        }] };
        var self = this;
        qv.post(`${this.data.host}/api/item/batch`, body).then(result => {
            let fetched = result.data.data.filter(x => x.group == 0);
            if (!fetched.length) {
                return;
            }
            fetched = fetched[0];
            let items = fetched.items;
            for (var i = 0; i < items.length; ++i) {
                switch(items[i].quality) {
                    case 0:
                        items[i].itemCss = 'gray';
                        break;
                    case 1:
                        items[i].itemCss = 'white';
                        break;
                    case 2:
                        items[i].itemCss = 'green';
                        break;
                    case 3:
                        items[i].itemCss = 'blue';
                        break;
                    case 4:
                        items[i].itemCss = 'purple';
                        break;
                    case 5:
                        items[i].itemCss = 'orange';
                        break;
                    default:
                        items[i].itemCss = '';
                        break;
                }
            }

            self.setData({
                items: items
            });
        });
    },
    onBackBtnClicked: function() {
        wx.navigateBack().catch(() => {
            wx.redirectTo({
              url: 'index'
            });
        });
    },
    onTabBtnClicked: function(event) {
        let active = event.currentTarget.dataset.active;
        this.setData({
            active: active
        });
    },
    parseTimeSpan: function (str) {
        if (str.indexOf('00:') == 0) {
            return str.substr(3);
        } else {
            return str;
        }
    },
    handleBoss: function(boss) {
        boss.Highest = parseInt(boss.Highest);
        boss.Lowest = parseInt(boss.Lowest);
        boss.Fastest = this.parseTimeSpan(boss.Fastest);
        boss.Slowest = this.parseTimeSpan(boss.Slowest);
        boss.ParseCss = 'gray';
        if (boss.Parse >= 25) {
            boss.ParseCss = 'green';
        }
        if (boss.Parse >= 50) {
            boss.ParseCss = 'blue';
        }
        if (boss.Parse >= 75) {
            boss.ParseCss = 'purple';
        }
        if (boss.Parse >= 95) {
            boss.ParseCss = 'orange';
        }
    },
    onLoad: function(options) {
        this.setData({ name: options.name, realm: options.realm });
        this.loadCharacter(options.name, options.realm);
    },
    onShareAppMessage: function () {
        return {
            title: this.data.name + ' - ' + this.data.realm
        };
    },
    onShareTimeline: function() {
        return {
            title: this.data.name + ' - ' + this.data.realm
        }
    }
})
