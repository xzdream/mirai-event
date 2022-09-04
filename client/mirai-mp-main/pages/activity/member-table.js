Page({
    /**
     * 页面的初始数据
     */
    data: {
        activity: "",
        characterGrid: [],
        characters: [],
        showDialog: false,
        isFullScreen: getApp().globalData.isFullScreen
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            activity: JSON.parse(options.activity)
        })
        this.drawCharacterGrid();
        this.drawCharacters();
      
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },
    drawCharacterGrid: function () {
        var result = [];
        console.log("开始初始化角色分配表格")
        var memberData = wx.getStorageSync('member-data');

        if (memberData.length === 0) {

            for (var index = 0; index < 25; index++) {
                console.log(index)
                var character = {
                    name: " "
                };
                result.push(character)
            }
        } else {
            let shareData = JSON.parse(memberData);

            for (var index = 0; index < shareData.length; index++) {

                var character = shareData[index];

                result.push(character)
            }
        }

        this.setCharacterGrid(result)

        let data = JSON.stringify(this.data.characterGrid);
        wx.setStorageSync('member-data', data)

    },
    drawCharacters: function () {
        let result = [];
        console.log("开始初始化角色分配")
        var member = wx.getStorageSync('fillMember');
        if (member.length === 0) {
            var size = this.data.activity.registrations.length;
            for (let i = 0; i < size; ++i) {
                let reg = this.data.activity.registrations[i];
                //通过申请的
                if (reg.status == 4) {
                    result.push(reg)
                }
            }
        } else {
            let shareData = JSON.parse(member);
            for (var index = 0; index < shareData.length; index++) {

                var character = shareData[index];
                result.push(character)
            }
        }
        this.setCharacters(result)

        var datas = JSON.stringify(this.data.characters);
        wx.setStorageSync('fillMember', datas)
    },
    setCharacterGrid: function (data) {
        var initValue = this;
        initValue.setData({
            characterGrid: data
        })

    },
    setCharacters: function (data) {
        var initValue = this;
        initValue.setData({
            characters: data
        })

    },

    actioncnt: function (e) {
        var fillIndex = e.currentTarget.dataset.index
        wx.setStorageSync('fillIndex', fillIndex)
        this.setData({
            showDialog: true
        })
    },
    checkboxChange(e) {
        var passName = e.detail.value
        this.setData({
            showDialog: false
        })
        var fillIndex = wx.getStorageSync('fillIndex')
        this.setData({
            [`characterGrid[${fillIndex}].name`]: passName
        })
        let gridData = JSON.stringify(this.data.characterGrid);
        wx.setStorageSync('member-data', gridData)
        var size = this.data.characters.length
        let idx = 0;
        for (let index = 0; index < size; index++) {
            var name = this.data.characters[index].name
            if (name == passName) {
                idx = index
                console.log("玩家：" + passName + " 已经被选择 需要删除下标为：" + index + " 的数据记录")
                break

            }

        }
        var characterMember =this.data.characters
        console.log(characterMember)
        characterMember.splice(idx,1);
        console.log(characterMember)
        this.setData({
            characters:characterMember
        })
        console.log(this.data.characters)
        let characterData = JSON.stringify(this.data.characters);
        wx.setStorageSync('fillMember', characterData)

    },
    closeSelectDialog: function () {
        this.setData({
            showDialog: false
        });
    },
    onBackBtnClicked: function () {
        wx.navigateBack();
    },



})