Page({
  /**
   * 页面的初始数据
   */
  data: {
    girdCacheName: "grid-cache",
    characterCacheName: "character-cache",
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
    var gridCacheData = wx.getStorageSync(this.data.girdCacheName);
    if (gridCacheData.length === 0) {
      for (var index = 0; index < 25; index++) {
        var grid = {
          name: " "
        };
        result.push(grid)
      }
    } else {
      let gridData = JSON.parse(gridCacheData);

      for (var index = 0; index < gridData.length; index++) {
        var grid = gridData[index];
        result.push(grid)
      }
    }
    this.setCharacterGrid(result)
    let data = JSON.stringify(this.data.characterGrid);
    wx.setStorageSync(this.data.girdCacheName, data)

  },

  drawCharacters: function () {
    let result = [];
    var member = wx.getStorageSync(this.data.characterCacheName);
    if (member.length === 0) {
      var size = this.data.activity.registrations.length;
      for (let i = 0; i < size; ++i) {
        let reg = this.data.activity.registrations[i];
        //通过申请的
        if (reg.status == 4) {
          var character = reg.name
          result.push(character)
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
    wx.setStorageSync(this.data.characterCacheName, datas)
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
    //选择的团员
    var passName = e.detail.value

    //找到点击的槽位
    var fillIndex = wx.getStorageSync('fillIndex')
    //槽位存在的团员
    var alreadyName = this.data.characterGrid[fillIndex].name

    //设置成新的
    this.setData({
      [`characterGrid[${fillIndex}].name`]: passName
    })
    var gridData = JSON.stringify(this.data.characterGrid);
    wx.setStorageSync(this.data.girdCacheName, gridData)
    var member = wx.getStorageSync(this.data.characterCacheName);
    var memberData = JSON.parse(member);

    var size = memberData.length
    for (var index = 0; index < size; index++) {
      var name = memberData[index]
      console.log("index:" + index + " name:" + name + " passName:" + passName)
      if (name == passName) {
        memberData.splice(index, 1);
        break
      }
    }
    if (alreadyName != null && alreadyName != " " && alreadyName != passName) {
      var newData = memberData.concat(alreadyName)
      memberData = newData

    }
    this.setData({
      characters: memberData
    })
    let characterData = JSON.stringify(memberData);
    wx.setStorageSync(this.data.characterCacheName, characterData)
    this.setData({
      showDialog: false
    })
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