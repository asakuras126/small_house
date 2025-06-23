Page({
  data: {
    errorMsg: '',
    loading: false
  },
  onShow() {
    const user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    const baseUrl = getApp().globalData.baseUrl;
    // 检查是否已有情侣关系
    wx.request({
      url: baseUrl + '/api/couples?user_id=' + encodeURIComponent(user_id),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.id) {
          // 已有情侣关系，跳转到首页
          wx.redirectTo({ url: '/pages/dashboard/dashboard' });
        }
      }
    });
  },
  onCreateCouple(e) {
    const partnerUsername = e.detail.value.partnerUsername;
    if (!partnerUsername) {
      this.setData({ errorMsg: '请输入伴侣用户名' });
      return;
    }
    const user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      this.setData({ errorMsg: '请先登录' });
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.setData({ loading: true, errorMsg: '' });
    const baseUrl = getApp().globalData.baseUrl;
    // 先查找伴侣user_id
    wx.request({
      url: baseUrl + '/api/users/find?username=' + encodeURIComponent(partnerUsername),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.id) {
          const partner_id = res.data.id;
          // 创建情侣关系
          wx.request({
            url: baseUrl + '/api/couples',
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: { user_id, partner_id },
            success: (res2) => {
              if (res2.statusCode === 200) {
                wx.showToast({ title: '创建成功', icon: 'success' });
                setTimeout(() => {
                  wx.redirectTo({ url: '/pages/dashboard/dashboard' });
                }, 1000);
              } else {
                this.setData({ errorMsg: res2.data.detail || '创建失败' });
              }
            },
            fail: () => {
              this.setData({ errorMsg: '网络错误' });
            },
            complete: () => {
              this.setData({ loading: false });
            }
          });
        } else {
          this.setData({ errorMsg: '未找到该用户名' });
          this.setData({ loading: false });
        }
      },
      fail: () => {
        this.setData({ errorMsg: '网络错误' });
        this.setData({ loading: false });
      }
    });
  }
}); 