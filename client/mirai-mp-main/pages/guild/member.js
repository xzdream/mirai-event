const app = getApp();
const qv = require("../../utils/qv");

Component({
    properties: {
        realm: null,
        guild: null
    },
    data: {
        isFullScreen: app.globalData.isFullScreen,
        realm: '',
        characterName: '',
        host: getApp().globalData.host,
        guildId: null,
        members: [],
        days: 30
    },
    methods: {
        loadMembers: function(guildId, days) {
            let self = this;
            qv.get(this.data.host + '/api/guild/' + guildId + '/members?days=' + days).then(result => {
                self.setData({
                    members: result.data.data
                });
            })
        },
        onSearchBtnClicked: function() {
            if (!this.data.characterName) {
                wx.showModal({
                    title: "错误",
                    content: "请填写角色名",
                    showCancel: false
                })
                return;
            }

            if (!this.data.realm) {
                wx.showModal({
                    title: "错误",
                    content: "请填写服务器名称",
                    showCancel: false
                });
                return;
            }

            wx.navigateTo({
              url: 'character/detail?name=' + this.data.characterName + '&realm=' + this.data.realm,
            })
        },
        onNavigateToHomeBtnClicked: function() {
            wx.redirectTo({
              url: 'index?redirect=no',
            });
        },
        onMemberClicked: function(event) {
            let member = event.currentTarget.dataset.member;
            let index = event.currentTarget.dataset.index;
            let data = {};
            data['members[' + index + ']._details'] = !!!member._details;
            this.setData(data);
        },
        changeDurationTab: function(event) {
            let days = event.currentTarget.dataset.days;
            this.setData({ days: days });
            this.loadMembers(this.data.guildId, days);
        }
    },
    lifetimes: {
        attached: function() {
            this.setData({
                realm: this.properties.realm || '',
                guildId: this.properties.guild.id
            });
            this.loadMembers(this.properties.guild.id, 30);
        }
    }
})
