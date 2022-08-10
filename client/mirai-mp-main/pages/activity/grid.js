Component({
    properties: {
        activity: null
    },

    data: {
        activity: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        canBack: false,
        bossAmount: 0,
        statistics: null,
        grouped: null,
        itemSets: null,
        groups: []
    },

    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                  url: 'guild?id=' + this.data.activity.guildId,
                })
            });
        },
        onGridNameClicked: function(event) {
            let idx = event.currentTarget.dataset.index;
            let data = {};
            data[`grouped[${idx}].display`] = !this.data.grouped[parseInt(idx)].display;
            this.setData(data);
        }
    },

    lifetimes: {
        attached: function () {
            let activity = this.properties.activity;
            let bossAmount = wx.$activity.data.bosses.length;
            let statistics = [];
            let grouped = [];

            // 处理分组
            for (let i = 0; i < activity.grids.data.length; ++i) {
                let grid = activity.grids.data[i];
                let group = { name: grid.name, parties: [], display: false };
                let data = grid.grid;
                let cell = group.parties;
                for (let partyIndex = 0; partyIndex < data.length; ++partyIndex) {
                    let party = [];
                    for (let memberIndex = 0; memberIndex < 5; ++memberIndex) {
                        let member = data[memberIndex][partyIndex];
                        if (member) {
                            let reg = activity.registrations.filter(x => x.name == member.name);
                            if (reg.length) {
                                party.push(reg[0]);
                            }
                        }
                    }
                    cell.push(party);
                }
                grouped.push(group);
            }
            if (grouped.length) {
                grouped[0].display = true;
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

                // 处理经验着色
                if (reg.bossPassed == bossAmount) {
                    reg._bossCss = 'purple';
                } else if (reg.bossPassed > bossAmount / 2) {
                    reg._bossCss = 'blue';
                } else if (reg.bossPassed > 0) {
                    reg._bossCss = 'green';
                } else {
                    reg._bossCss = 'gray';
                }
            }

            this.setData({
                activity: activity,
                canBack: !!wx.$guild,
                statistics: statistics,
                grouped: grouped,
                bossAmount: bossAmount
            });
        }
    }
})
