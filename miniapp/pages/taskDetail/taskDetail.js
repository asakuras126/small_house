Page({
  data: {
    task: {},
    partner: null
  },
  onLoad(options) {
    const user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    const id = options.id;
    this.taskId = id;
    const baseUrl = getApp().globalData.baseUrl;

    // 先获取情侣信息，再获取任务详情
    wx.request({
      url: baseUrl + '/api/couples?user_id=' + encodeURIComponent(user_id),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const couple = res.data;
          const isUser1 = couple.user1_id === user_id;
          const partner = {
            id: isUser1 ? couple.user2_id : couple.user1_id,
            username: isUser1 ? couple.user2_name : couple.user1_name
          };
          this.setData({ partner }, () => {
            // partner 设置好后再获取任务详情
            wx.request({
              url: baseUrl + '/api/tasks/' + id + '?user_id=' + encodeURIComponent(user_id),
              method: 'GET',
              success: (res) => {
                if (res.statusCode === 200) {
                  const task = this.processTask(res.data);
                  this.setData({ task });
                }
              }
            });
          });
        }
      }
    });
  },

  processTask(task) {
    // 处理日期显示
    const date = new Date(task.date);
    const formattedDate = date.toISOString().split('T')[0].replace('T', ' ');
    
    // 处理负责人显示
    let assignee_name = '未知';
    if (task.assignee === 'both') {
      assignee_name = '双方';
    } else if (this.data.partner) {
      assignee_name = task.assignee === this.data.partner.id ? 
        this.data.partner.username : '我';
    }

    // 处理优先级显示
    const priorityMap = {
      'high': '高',
      'medium': '中',
      'low': '低'
    };

    // 处理描述显示
    const description = task.description ? task.description : '无';

    return {
      ...task,
      date: formattedDate,
      assignee: assignee_name,
      priority: priorityMap[task.priority] || '中',
      description
    };
  },

  onEdit() {
    wx.navigateTo({ url: '/pages/taskForm/taskForm?id=' + this.taskId });
  },

  onDelete() {
    const user_id = wx.getStorageSync('user_id');
    const baseUrl = getApp().globalData.baseUrl;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该任务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: baseUrl + '/api/tasks/' + this.taskId + '?user_id=' + encodeURIComponent(user_id),
            method: 'DELETE',
            success: (res2) => {
              if (res2.statusCode === 204) {
                wx.showToast({ title: '删除成功', icon: 'success' });
                setTimeout(() => {
                  wx.redirectTo({ url: '/pages/task/task' });
                }, 1000);
              } else {
                wx.showToast({ title: '删除失败', icon: 'none' });
              }
            },
            fail: () => {
              wx.showToast({ title: '网络错误', icon: 'none' });
            }
          });
        }
      }
    });
  }
}); 