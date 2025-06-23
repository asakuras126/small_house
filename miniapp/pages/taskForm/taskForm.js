Page({
  data: {
    date: '',
    time: '',
    priorityOptions: ['高', '中', '低'],
    priorityIndex: 1,
    assigneeOptions: ['我', '对方', '两人共同'],
    assigneeIndex: 0,
    errorMsg: '',
    loading: false,
    isEdit: false,
    taskId: '',
    title: '',
    description: '',
    partner: null,
    completed: false
  },
  onLoad(options) {
    // 获取情侣信息
    const user_id = wx.getStorageSync('user_id');
    const baseUrl = getApp().globalData.baseUrl;
    wx.request({
      url: baseUrl + '/api/couples?user_id=' + encodeURIComponent(user_id),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const couple = res.data;
          // 确定当前用户是 user1 还是 user2
          const isUser1 = couple.user1_id === user_id;
          const partner = {
            id: isUser1 ? couple.user2_id : couple.user1_id,
            username: isUser1 ? couple.user2_name : couple.user1_name
          };
          this.setData({ partner });
        }
      }
    });

    if (options.id) {
      // 编辑模式，加载任务详情
      const user_id = wx.getStorageSync('user_id');
      const baseUrl = getApp().globalData.baseUrl;
      wx.request({
        url: baseUrl + '/api/tasks/' + options.id + '?user_id=' + encodeURIComponent(user_id),
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            const task = res.data;
            const date = task.date ? task.date.split('T')[0] : '';
            const time = task.date ? (task.date.split('T')[1] || '').substring(0,5) : '';
            const priorityIndex = ['high', 'medium', 'low'].indexOf(task.priority);
            this.setData({
              isEdit: true,
              taskId: options.id,
              date,
              time,
              priorityIndex: priorityIndex >= 0 ? priorityIndex : 1,
              title: task.title,
              description: task.description,
              completed: task.completed || false
            });
          }
        }
      });
    }
  },
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },
  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },
  onPriorityChange(e) {
    this.setData({ priorityIndex: e.detail.value });
  },
  onAssigneeChange(e) {
    this.setData({ assigneeIndex: e.detail.value });
  },
  onCompletionChange(e) {
    this.setData({
      completed: e.detail.value
    });
  },
  onCreateTask(e) {
    console.log('提交表单', e);
    const { title, description, date, time, priorityOptions, priorityIndex, assigneeIndex, isEdit, taskId, partner, completed } = this.data;
    if (!title || !date) {
      this.setData({ errorMsg: '请填写标题和日期' });
      return;
    }
    const user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.setData({ loading: true, errorMsg: '' });
    // 获取情侣关系id
    const baseUrl = getApp().globalData.baseUrl;
    wx.request({
      url: baseUrl + '/api/couples?user_id=' + encodeURIComponent(user_id),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.id) {
          const couple_id = res.data.id;
          // 合并日期和时间
          const dateTime = date + 'T' + (time || '00:00') + ':00';
          
          // 确定负责人
          let assignee;
          if (assigneeIndex === 0) {
            assignee = user_id;
          } else if (assigneeIndex === 1 && partner) {
            assignee = partner.id;
          } else {
            assignee = 'both';
          }

          // 创建或编辑
          if (!isEdit) {
            wx.request({
              url: baseUrl + '/api/tasks?user_id=' + encodeURIComponent(user_id),
              method: 'POST',
              header: { 'Content-Type': 'application/json' },
              data: {
                title,
                description,
                date: dateTime,
                assignee,
                priority: ['high', 'medium', 'low'][priorityIndex],
                couple_id,
                completed
              },
              success: (res2) => {
                console.log('创建任务返回', res2);
                if (res2.statusCode === 200 || res2.statusCode === 201) {
                  wx.showToast({ title: '创建成功', icon: 'success' });
                  setTimeout(() => {
                    wx.redirectTo({ url: '/pages/task/task' });
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
            wx.request({
              url: baseUrl + '/api/tasks/' + taskId + '?user_id=' + encodeURIComponent(user_id),
              method: 'PUT',
              header: { 'Content-Type': 'application/json' },
              data: {
                title,
                description,
                date: dateTime,
                assignee,
                priority: ['high', 'medium', 'low'][priorityIndex],
                couple_id,
                completed
              },
              success: (res2) => {
                if (res2.statusCode === 200) {
                  wx.showToast({ title: '编辑成功', icon: 'success' });
                  setTimeout(() => {
                    wx.redirectTo({ url: '/pages/task/task' });
                  }, 1000);
                } else {
                  this.setData({ errorMsg: res2.data.detail || '编辑失败' });
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
        } else {
          this.setData({ errorMsg: '请先创建情侣关系' });
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