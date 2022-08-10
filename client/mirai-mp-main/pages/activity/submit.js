const qv = require("../../utils/qv");
let lock = false;

Component({
    properties: {
        activity: null,
        guild: null
    },

    data: {
        activity: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        canBack: false,
        myCharacters: [],
        name: '',
        newCharacter: {
            name: '',
            class: 0,
            realm: null
        },
        ui: {
            selectClass: false,
            selectClassValue: null,
            submitDialog: false,
            selectedRole: null
        },
        selectedCharacter: null,
        submitHint: ''
    },

    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                  url: 'guild?id=' + this.data.activity.guildId,
                })
            });
        },
        saveCharacters: function(characters) {
            wx.setStorageSync('myCharacters-' + this.data.activity.realm, characters || []);
        },
        onClassClicked: function() {
            this.setData({
                'ui.selectClass': true
            });
        },
        onClassOptionClicked: function(event) {
            let cls = event.currentTarget.dataset.class;
            this.setData({
                'ui.selectClassValue': cls
            });
        },
        closeSelectDialog: function() {
            this.setData({
                'ui.selectClass': false
            });
        },
        selectClass: function() {
            this.setData({
                'newCharacter.class': this.data.ui.selectClassValue,
                'ui.selectClass': false
            });
        },
        onAddCharacterClicked: function() {
            let character = this.data.newCharacter;
            character.name = this.data.name;
            if (!character.name) {
                wx.showModal({
                    title: "错误",
                    content: "请填写角色名",
                    showCancel: false
                });
                return;
            }

            if (!character.class) {
                wx.showModal({
                    title: "错误",
                    content: "请选择角色职业",
                    showCancel: false
                });
                return;
            }

            let characters = this.data.myCharacters;
            this.handleCharacter(this.data.activity, character);
            characters.push(character);
            this.saveCharacters(characters);
            this.setData({
                myCharacters: characters,
                newCharacter: {
                    name: '',
                    class: 0,
                    realm: this.data.activity.realm
                },
                name: ''
            });
        },
        handleCharacter: function(activity, ch) {
            ch._registered = activity.registrations.filter(x => x.name == ch.name).length > 0;
            if (ch._registered) {
                ch._reg = activity.registrations.filter(x => x.name == ch.name)[0];
            } else {
                if (ch._reg) {
                    delete ch._reg;
                }
            }
            ch._canTank = this.canTank(ch.class);
            ch._canHeal = this.canHeal(ch.class);
        },
        canTank: function (cls) {
            return 35 & parseInt(cls);
        },
        canHeal: function (cls) {
            return 298 & parseInt(cls);
        },
        onCharacterClicked: function(event) {
            let ch = event.currentTarget.dataset.character;
            this.handleCharacter(this.data.activity, ch);
            this.setData({
                selectedCharacter: ch,
                'ui.submitDialog': true
            });
        },
        closeSubmitDialog: function() {
            this.setData({
                selectedCharacter: null,
                'ui.submitDialog': false
            });
        },
        deleteSelectedCharacter: function() {
            let ch = this.data.myCharacters.filter(x => x.name == this.data.selectedCharacter.name)[0];
            let idx = this.data.myCharacters.indexOf(ch);
            if (idx >= 0) {
                this.data.myCharacters.splice(idx, 1);
                this.setData({
                    myCharacters: this.data.myCharacters
                });
            }

            this.closeSubmitDialog();
        },
        onRoleClicked: function(event) {
            let role = event.currentTarget.dataset.role;
            if (role == 0 && !this.canTank(this.data.selectedCharacter.class)) {
                return;
            }
            if (role == 2 && !this.canHeal(this.data.selectedCharacter.class)) {
                return;
            }
            this.setData({
                'ui.selectedRole': role
            });
        },
        onSubmitClicked: function() {
            if (this.data.activity.status != 1) {
                return;
            }
            let expire = wx.getStorageSync('userInfoExpire');
            if (!expire || new Date().getTime() > expire) {
                wx.removeStorageSync('userInfo');
                wx.removeStorageSync('userInfoExpire');
            }
            let userInfo = wx.getStorageSync('userInfo');
            let self = this;
            if (userInfo) {
                self.doSubmit(userInfo.nickName, userInfo.avatarUrl);
            } else {
                wx.getUserProfile({
                  desc: '用于完善报名信息',
                  success: function(res) {
                    wx.setStorageSync('userInfoExpire', new Date().getTime() + 1000 * 60 * 60 * 24 * 14);
                    wx.setStorageSync('userInfo', res.userInfo)
                    self.doSubmit(res.userInfo.nickName, res.userInfo.avatarUrl);
                  },
                  fail: function() {
                      if (self.data.guild.registerPolicy == 1) {
                        wx.showModal({
                            showCancel: false,
                            title: '错误',
                            content: '本公会要求授权读取微信头像与昵称才能报名'
                        });
                      } else {
                        self.doSubmit(null, null);
                      }
                  }
                })
            }
        },
        doSubmit: function(weChat, avatarUrl) {
            if (lock) { return; }
            lock = true;
            if (!this.data.ui.selectedRole) {
                wx.showModal({
                    title: "错误",
                    content: "请选择一个职责",
                    showCancel: false
                });
                lock = false;
                return;
            }

            let self = this;
            let body = {
                name: this.data.selectedCharacter.name,
                role: this.data.ui.selectedRole,
                hint: this.data.hint,
                class: this.data.selectedCharacter.class,
                weChat: weChat,
                avatarUrl: avatarUrl,
                guildId: this.data.activity.domainGuildId,
                guildNameCache: this.data.activity.domainGuildName
            };

            let p;
            if (this.data.activity.description) {
                p = new Promise((res, rej) => {
                    wx.showModal({
                        title: '活动须知',
                        content: this.data.activity.description,
                        cancelText: '我拒绝',
                        cancelColor: 'cancelColor',
                        confirmText: '我接受',
                        success: function(result) {
                            if (result.confirm) {
                                res();
                            } else {
                                lock = false;
                                wx.showToast({
                                  title: '报名取消',
                                  icon: 'none'
                                });
                                rej();
                            }
                        },
                        fail: function() {
                            lock = false;
                            wx.showToast({
                              title: '报名取消',
                              icon: 'none'
                            });
                            rej();
                        }
                    });
                });
            } else {
                p = new Promise((res) => res());
            }

            p.then(() => {
                wx.showLoading({
                    title: '报名中...',
                })
                return qv.post(`${self.data.host}/api/activity/${self.data.activity.id}/registrations`, body).then(data => {
                    wx.hideLoading({});
                    wx.$activity.loadActivity();
                    self.setData({
                        selectedCharacter: null,
                        'ui.selectedRole': false,
                        'ui.submitDialog': false
                    });
                    wx.redirectTo({
                      url: 'activity?id=' + this.data.activity.id + '&domain=' + this.data.activity.domainGuildId,
                    });
                    wx.showToast({
                      title: '报名成功',
                    });
                    lock = false;
                }).catch(err => {
                    lock = false;
                });
            });
        },
        onTakeLeaveClicked: function() {
            let ch = this.data.selectedCharacter;
            this.takeLeave(ch, ch._reg.status != 3);
        },
        takeLeave: function (ch, takeLeave) {
            let reg = ch._reg;
            reg.status = takeLeave ? 3 : 0;
            wx.showLoading({
                title: takeLeave ? '请假中...' : '取消请假中...',
            })
            let self = this;
            return qv.put(this.data.host + '/api/activity/' + this.data.activity.id + '/registrations/' + reg.id, { status: reg.status, role: reg.role }).then(() => {
                wx.hideLoading({});
                self.setData({
                    selectedCharacter: null,
                    'ui.selectedRole': false,
                    'ui.submitDialog': false
                });
                wx.redirectTo({
                  url: 'activity?id=' + this.data.activity.id,
                })
                wx.showToast({
                  title: '操作成功',
                })
            });
        },
        loadGuild: function(guildId) {
            let self = this;
            wx.showLoading({
              title: '正在加载信息...',
            });
            return qv.get(`${this.data.host}/api/guild/${guildId}`).then(result => {
                let guild = result.data.data;
                wx.setNavigationBarTitle({
                    title: guild.name,
                })
                self.setData({ guild: guild });
                wx.hideLoading({});
            });
        },
        onShowPricingBtnClicked: function() {
            wx.navigateTo({
                url: 'guild/pricing?id=' + this.data.activity.guildId,
            })
        }
    },

    lifetimes: {
        attached: function () {
            let activity = this.properties.activity;
            this.loadGuild(activity.guildId);
            let myCharacters = wx.getStorageSync('myCharacters-' + activity.realm) || [];
            for (let i = 0; i < myCharacters.length; ++i) {
                this.handleCharacter(activity, myCharacters[i]);
            }

            this.setData({
                activity: activity,
                canBack: !!wx.$guild,
                myCharacters: myCharacters,
                'newCharacter.realm': activity.realm
            });
        }
    }
})
