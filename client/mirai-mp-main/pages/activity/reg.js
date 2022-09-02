const qv = require("../../utils/qv");

Component({
    properties: {
        activity: null
    },

    data: {
        activityHostGuild: null,
        activityCurrentGuild: null,
        activity: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        shortWidth: getApp().globalData.shortWidth,
        canBack: false,
        bossAmount: 0,
        groups: [{
                id: 0,
                name: '坦克',
                img: '/assets/images/tank.jpg'
            },
            {
                id: 2,
                name: '治疗',
                img: '/assets/images/healer.jpg'
            },
            {
                id: 1,
                name: '输出',
                img: '/assets/images/dps.jpg'
            },
            {
                id: 3,
                name: '消费',
                img: '/assets/images/consumer.jpg'
            }
        ],
        statistics: null,
        grouped: null,
        itemSets: null,
        permission: {},
        selectedReg: null,
        action: null
    },

    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                  url: 'guild?id=' + this.data.activity.guildId,
                })
            });
        },
        onPlayerClicked: function(event) {
            let reg = event.currentTarget.dataset.reg;

            if (!this.data.permission.guildManager) {
                this.openWclPage(reg.name, this.data.activity.realm);
                return;
            }

            this.setData({
                selectedReg: reg,
                action: null
            });
        },
        onDialogCloseBtnClicked: function() {
            this.setData({
                selectedReg: null,
                action: null
            });
        },
        getGuildPermissions: function() {
            let self = this;
            qv.requestWithCredential(this.data.host + '/api/user/permission', 'GET').then(result => {
                self.setData({ permission: result.data.data });
            });
        },
        onActionOptClicked: function(event) {
            let action = event.currentTarget.dataset.action;
            this.setData({
                action: action
            });
        },
        onDialogOkBtnClicked: function() {
            if (this.data.action == 'accept') {
                this.setStatus(this.data.selectedReg.id, 4, this.data.selectedReg.role);
            } else if (this.data.action == 'reject') {
                this.setStatus(this.data.selectedReg.id, 1, this.data.selectedReg.role);
            } else if (this.data.action == 'standby') {
                this.setStatus(this.data.selectedReg.id, 2, this.data.selectedReg.role);
            } else if (this.data.action == 'dps') {
                this.setStatus(this.data.selectedReg.id, this.data.selectedReg.status, 1);
            } else if (this.data.action == 'hps') {
                this.setStatus(this.data.selectedReg.id, this.data.selectedReg.status, 2);
            } else if (this.data.action == 'tank') {
                this.setStatus(this.data.selectedReg.id, this.data.selectedReg.status, 0);
            } else if (this.data.action == 'consumer') {
                this.setStatus(this.data.selectedReg.id, this.data.selectedReg.status, 3);
            } else if (this.data.action == 'delete') {
                this.deleteReg(this.data.selectedReg.id);
            }
        },
        setStatus: function (id, status, role) {
            qv.put(this.data.host + '/api/activity/' + this.data.activity.id + '/registrations/' + id, { status: status, role: role });
            let reg = this.data.activity.registrations.filter(x => x.id == this.data.selectedReg.id)[0];
            reg.role = role;
            reg.status = status;
            this.init(this.data.activity);
            this.setData({
                selectedReg: null,
                action: null
            });
            if (wx.$activity) {
                wx.$activity.setData({ activity: this.data.activity });
            }
        },
        deleteReg: function (id) {
            qv.delete(this.data.host + '/api/activity/' + this.data.activity.id + '/registrations/' + id);
            let reg = this.data.activity.registrations.filter(x => x.id == this.data.selectedReg.id)[0];
            let idx = this.data.activity.registrations.indexOf(reg);
            if (idx >= 0) {
                this.data.activity.registrations.splice(idx, 1);
                this.init(this.data.activity);
            }
            this.setData({
                selectedReg: null,
                action: null
            });
            if (wx.$activity) {
                wx.$activity.setData({ activity: this.data.activity });
            }
        },
        init: function (activity) {
            let bossAmount = wx.$activity.data.bosses.length;
            let statistics = [];
            let grouped = [];

            this.getGuildPermissions();

            this.setData({
                activityHostGuild: activity.guildId,
                activityCurrentGuild: activity.domainGuildId
            });

            // 处理分组
            for (let i = 0; i < this.data.groups.length; ++i) {
                let group = this.data.groups[i];
                let statisticsItem = {};
                statisticsItem.submit = activity.registrations.filter(x => x.role == group.id).length;
                statisticsItem.accepted = activity.registrations.filter(x => x.role == group.id && x.status == 4).length;
                statisticsItem.standby = activity.registrations.filter(x => x.role == group.id && x.status == 2).length;
                statistics.push(statisticsItem);
                let groupedItem = activity.registrations.filter(x => x.role == group.id);
                grouped.push(groupedItem);
            }

            for (let i = 0; i < activity.registrations.length; ++i) {
                let reg = activity.registrations[i];

                // 处理WCL着色
                if (reg.wcl) {
                    reg.wcl = parseInt(reg.wcl);
                    reg._wclCss = 'gray';
                    if (reg.wcl >= 25) {
                        reg._wclCss = 'green';
                    }
                    if (reg.wcl >= 50) {
                        reg._wclCss = 'blue';
                    }
                    if (reg.wcl >= 75) {
                        reg._wclCss = 'purple';
                    }
                    if (reg.wcl >= 95) {
                        reg._wclCss = 'orange';
                    }
                } else {
                    reg.wcl = '未知';
                }

                // 处理装等着色
                if (reg.boss) {
                    for (let j = 0; j < reg.boss.length; ++j) {
                        let boss = reg.boss[j];
                        let raid = wx.$activity.data.raids.filter(x => x.id == parseInt(activity.raids.split(',')[0].trim()));
                        if (!raid.length) {
                            continue;
                        }
                        raid = raid[0];
                        let itemLevel = boss.ItemLevel;
                        if (itemLevel < raid.itemLevelEntrance) {
                            boss._itemCss = 'gray';
                        } else if (itemLevel < raid.itemLevelPreference && itemLevel >= raid.itemLevelEntrance) {
                            boss._itemCss = 'green';
                        } else if (itemLevel < raid.itemLevelGraduated && itemLevel >= raid.itemLevelPreference) {
                            boss._itemCss = 'blue';
                        } else if (itemLevel < raid.itemLevelFarm && itemLevel >= raid.itemLevelGraduated) {
                            boss._itemCss = 'purple';
                        } else {
                            boss._itemCss = 'orange';
                        }
                    }

                    let highest = reg.boss.filter(x => x.ItemLevel == reg.charactor.highestItemLevel);
                    if (highest.length) {
                        highest = highest[0];
                        reg.charactor._itemCss = highest._itemCss;
                    }
                }

                // 处理套装显示
                if (reg.charactor) {
                    reg._equipments = reg.charactor.equipments.split(',').map(x => x.trim());
                    let sets = wx.$activity.data.itemSets[reg.role.toString()];
                    if (sets) {
                        for (let j = 0; j < sets.length; ++j) {
                            try {
                                reg.setName = sets[j].name;
                                reg.setCount = 0;
        
                                for (let k = 0; k < sets[j].items.length; ++k) {
                                    if (reg._equipments.some(x => x == sets[j].items[k])) {
                                        ++reg.setCount;
                                    }
                                }
        
                                if (reg.setCount > 0) {
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                }

                // 处理经验着色
                if (reg.bossPassed) {
                    if (reg.bossPassed == bossAmount) {
                        reg._bossCss = 'purple';
                    } else if (reg.bossPassed > bossAmount / 2) {
                        reg._bossCss = 'blue';
                    } else if (reg.bossPassed > 0) {
                        reg._bossCss = 'green';
                    } else {
                        reg._bossCss = 'gray';
                    }
                } else {
                    reg._bossCss = 'gray';
                }
            }

            this.setData({
                activity: activity,
                canBack: !!wx.$guild,
                statistics: statistics,
                grouped: grouped,
                bossAmount: bossAmount,
                permission: wx.$activity.data.permission
            });
        },
        openWclPage: function(name, realm) {
            wx.navigateTo({
              url: 'character/detail?name=' + name + '&realm=' + realm
            });
        },
        onQueryWclBtnClicked: function(event) {
            let realm = event.currentTarget.dataset.realm;
            let name = event.currentTarget.dataset.name;
            this.openWclPage(name, realm);
        },
        onShowPricingBtnClicked: function() {
            wx.navigateTo({
                url: 'guild/pricing?id=' + this.data.activity.guildId,
            })
        },
        onBackToHomeBtnClicked: function() {
            wx.redirectTo({
              url: 'index?redirect=no',
            });
        },
        onBtnClickToTable:function(){
          wx.navigateTo({
            url: 'activity/member-table?activity=' + JSON.stringify(this.data.activity),
        })
        },
        onRefreshBtnClicked: function() {
            wx.$activity.onLoad({ id: this.data.activity.id });
        },
        onShareToGuildBtnClicked: function() {
            wx.navigateTo({
              url: 'activity/share?activity=' + this.data.activity.id
            })
        }
    },

    lifetimes: {
        attached: function () {
            this.init(this.properties.activity);
        }
    }
})
