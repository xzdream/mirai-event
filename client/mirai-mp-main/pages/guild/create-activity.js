const qv = require("../../utils/qv");
const moment = require("../../utils/moment");

Page({
    data: {
        guildId: null,
        host: getApp().globalData.host,
        isFullScreen: getApp().globalData.isFullScreen,
        name: '',
        description: '',
        begin: moment(new Date()).format('YYYY-MM-DD HH:00'),
        deadline: moment(new Date()).format('YYYY-MM-DD HH:00'),
        duration: 4.5,
        raids: [],
        selectedRaids: []
    },
    onLoad: function(options) {
        let guildId = options.id || options.scene;
        this.setData({
            guildId: guildId
        });
        console.log("加载raids")
        this.loadRaids();
    },
    onBackBtnClicked: function() {
        wx.navigateBack().catch(() => {
            wx.redirectTo({
              url: 'guild?id=' + this.data.guildId
            });
        });
    },
    loadRaids: function () {
        let self = this;
        this.raids = qv.get(this.data.host + '/api/raid').then(result => {
            self.setData({
                raids: result.data.data
            });
        });
    },
    toggleRaid: function(event) {
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
    handleDateTimePickerChanged: function(event) {
        let field = event.currentTarget.dataset.field;
        let data = {};
        let date = event.detail.dateString;
        date = date.substr(0, date.lastIndexOf(':'));
        data[field] = date;
        this.setData(data);
    },
    createActivity: function() {
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
          title: '创建中...',
        });
        qv.post(this.data.host + '/api/activity', {
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
                  title: '活动创建成功',
                });
                wx.navigateTo({
                  url: '../activity?id=' + result.data.data.id,
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
})
