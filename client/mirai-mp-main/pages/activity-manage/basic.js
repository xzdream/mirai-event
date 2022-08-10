const qv = require("../../utils/qv");
const moment = require("../../utils/moment");

Component({
    properties: {
        activity: null,
        permission: null
    },
    data: {
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        name: '',
        description: '',
        begin: '',
        deadline: '',
        duration: '',
        raids: [],
        selectedRaids: [],
        guildId: null,
        allowForward: null
    },
    methods: {
        onBackBtnClicked: function () {
            wx.navigateBack().catch(() => {
                wx.redirectTo({
                    url: 'guild?id=' + this.data.guildId
                });
            });
        },
        loadRaids: function () {
            let self = this;
            return this.raids = qv.get(this.data.host + '/api/raid').then(result => {
                self.setData({
                    raids: result.data.data
                });
            });
        },
        toggleRaid: function (event) {
            let index = event.currentTarget.dataset.index;
            let raidId = event.currentTarget.dataset.raid;
            let data = {};
            data[`raids[${index}].checked`] = !this.data.raids[index].checked;
            this.setData(data);
            if (data[`raids[${index}].checked`]) {
                this.data.selectedRaids.push(raidId);
            } else {
                let idx = this.data.selectedRaids.indexOf(raidId);
                this.data.selectedRaids.splice(idx, 1);
            }
            this.setData({
                selectedRaids: this.data.selectedRaids
            });
        },
        handleDateTimePickerChanged: function (event) {
            let field = event.currentTarget.dataset.field;
            let data = {};
            let date = event.detail.dateString;
            date = date.substr(0, date.lastIndexOf(':'));
            data[field] = date;
            this.setData(data);
        },
        updateActivity: function () {
            if (!this.data.name) {
                wx.showModal({
                    title: "错误",
                    content: '活动名称不能为空',
                    showCancel: false
                });
                return;
            }

            if (!this.data.duration || isNaN(parseFloat(this.data.duration))) {
                wx.showModal({
                    title: "错误",
                    content: '活动时长填写不正确',
                    showCancel: false
                });
                return;
            }

            if (this.data.selectedRaids.length == 0) {
                wx.showModal({
                    title: "错误",
                    content: '请至少选择一个副本',
                    showCancel: false
                });
                return;
            }

            wx.showLoading({
                title: '更新中...',
            });

            qv.put(this.data.host + '/api/activity/' + this.properties.activity.id, {
                name: this.data.name,
                server: 0,
                realm: null,
                description: this.data.description,
                deadline: moment(this.data.deadline + ":00").utc().format('YYYY-MM-DDTHH:mmZ'),
                begin: moment(this.data.begin + ":00").utc().format('YYYY-MM-DDTHH:mmZ'),
                estimatedDurationInHours: this.data.duration,
                raids: this.data.selectedRaids.toString(),
                allowForward: this.data.allowForward
            }).then(result => {
                wx.hideLoading({});
                if (result.data.code == 200) {
                    wx.showToast({
                        title: '活动修改成功',
                    });
                } else {
                    wx.showModal({
                        title: "错误",
                        content: result.data.message,
                        showCancel: false
                    });
                }
            });
        },
        switchAllowForward: function(event) {
            let allow = event.currentTarget.dataset.allow;
            this.setData({
                allowForward: allow
            });
        }
    },
    lifetimes: {
        attached: function () {
            let activity = this.properties.activity;
            let self = this;
            this.loadRaids().then(() => {
                let selectedRaids = activity.raids.split(',').map(x => parseInt(x.trim()));

                for (let i = 0; i < self.data.raids.length; ++i) {
                    self.data.raids[i].checked = selectedRaids.some(x => x == self.data.raids[i].id);
                }

                self.setData({
                    permission: self.properties.permission,
                    begin: moment(activity.begin).format('YYYY-MM-DD HH:mm'),
                    deadline: moment(activity.deadline).format('YYYY-MM-DD HH:mm'),
                    name: activity.name,
                    description: activity.description,
                    duration: activity.estimatedDurationInHours,
                    selectedRaids: selectedRaids,
                    raids: self.data.raids,
                    guildId: activity.guildId,
                    allowForward: activity.allowForward
                });
            });
        }
    }
})
