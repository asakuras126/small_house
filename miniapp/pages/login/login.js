Page({
  data: {
    errorMsg: '',
    loading: false,
    showManualLogin: false
  },

  quickLogin(e) {
    const type = e.currentTarget.dataset.type;
    let username, password;
    
    if (type === 'yy') {
      username = 'yy';
      password = 'yy';
    } else if (type === 'll') {
      username = 'll';
      password = 'll';
    }

    this.performLogin(username, password);
  },

  toggleManualLogin() {
    this.setData({
      showManualLogin: !this.data.showManualLogin,
      errorMsg: ''
    });
  },

  onLogin(e) {
    const { username, password } = e.detail.value;
    if (!username || !password) {
      this.setData({ errorMsg: '请填写用户名和密码' });
      return;
    }
    this.performLogin(username, password);
  },

  performLogin(username, password) {
    this.setData({ loading: true, errorMsg: '' });
    const baseUrl = getApp().globalData.baseUrl;
    
    wx.request({
      url: baseUrl + '/api/users/login',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { username, password },
      success: (res) => {
        if (res.statusCode === 200 && res.data.user_id) {
          wx.setStorageSync('user_id', res.data.user_id);
          wx.showToast({ 
            title: '登录成功', 
            icon: 'success',
            duration: 1000
          });
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/task/task' });
          }, 1000);
        } else {
          this.setData({ errorMsg: res.data.detail || '登录失败' });
        }
      },
      fail: () => {
        this.setData({ errorMsg: '网络错误' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  }
}); 