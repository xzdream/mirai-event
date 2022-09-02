// pages/activity/member-table.js


Page({
  /**
   * 页面的初始数据
   */
  data: {
    activity: "",
    characterGrid: [],
    characters: [],
    showDialog: false


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      activity: JSON.parse(options.activity),
      characters: this.initCharacter(JSON.parse(options.activity))
    })
    this.drawCharacterGrid();
  },
  /**
   * 当点击Item的时候传递过来
   */
  bindNavigator: function (e) {

    wx.navigateTo({
      name: e.currentTarget.dataset.path,
    })

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


  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog,
    });

  },
  onBackBtnClicked: function () {
    wx.navigateBack();
  },



  drawCharacterGrid: function () {

    var result = [];
    console.log("开始初始化角色分配表格")
    var memberData = wx.getStorageSync('member-data');
    // console.log("缓存中的数据为:" + memberData.length)
    if (memberData.length === 0) {
      // console.log("缓存中无数据 需要初始化")
      for (var index = 0; index < 25; index++) {
        console.log(index)
        var character = {
          name: " "
        };
        result.push(character)
      }
    } else {
      let shareData = JSON.parse(memberData);
      // console.log("shareData:=====" + shareData)
      for (var index = 0; index < shareData.length; index++) {

        var character = shareData[index];
        // console.log("character:=====" + character)
        result.push(character)
      }
    }
    // console.log("初始数据为:" + result)
    this.setCharacterGrid(result)

    let data = JSON.stringify(this.data.characterGrid);
    wx.setStorageSync('member-data', data)
    // console.log("设置数据到本地缓存中 ：" + data)
    return result;

  },
  setCharacterGrid: function (data) {
    // console.log("设置数据：" + data)
    var initValue = this;
    initValue.setData({
      characterGrid: data
    })

  },
  initCharacter: function (activity) {
    let result = [];
    var size = activity.registrations.length;
    for (let i = 0; i < size; ++i) {
      let reg = activity.registrations[i];
      //通过申请的或者替补队员
      if (reg.status == 4) {
        result.push(reg)
      }
    }
    return result;
  },
  actioncnt: function () {
    let list = []
    for (let i = 13; i < this.data.characters.length; ++i) {
      list.push(this.data.characters[i].name)
    }
    console.log(list)
    wx.showActionSheet({
      itemList: list,
      success: function (res) {
        console.log(res.tapIndex)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  }



})