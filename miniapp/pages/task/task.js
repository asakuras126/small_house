const app = getApp();

Page({
  data: {
    tasks: [],
    groupedTasks: {},
    dateHeaders: {},
    filter: 'all',
    loading: true,
    partner: null
  },

  onLoad() {
    // 检查用户是否已登录
    const user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.loadTasks();
  },

  onShow() {
    // 检查用户是否已登录
    const user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    this.loadTasks();
  },

  onPullDownRefresh() {
    this.loadTasks();
  },

  loadTasks() {
    const user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }

    this.setData({ loading: true });
    const baseUrl = getApp().globalData.baseUrl;

    // 获取情侣信息
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
          this.setData({ partner });
        }
      }
    });

    // 获取任务列表
    wx.request({
      url: baseUrl + '/api/tasks?user_id=' + encodeURIComponent(user_id),
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const tasks = this.processTasks(res.data);
          this.setData({
            tasks: tasks,
            loading: false
          });
          this.filterTasks(this.data.filter);
          wx.stopPullDownRefresh();
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  processTasks(tasks) {
    return tasks.map(task => {
      const date = new Date(task.date);
      const time = date.toTimeString().slice(0, 5);
      const dateStr = date.toISOString().split('T')[0];
      
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

      // 处理日期显示
      const formattedDate = dateStr.replace('T', ' ');

      return {
        ...task,
        time,
        dateStr: formattedDate,
        assignee_name,
        priority_text: priorityMap[task.priority] || '中',
        description
      };
    });
  },

  filterTasks(filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredTasks = this.data.tasks;
    switch (filter) {
      case 'today':
        filteredTasks = this.data.tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate.toDateString() === today.toDateString();
        });
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filteredTasks = this.data.tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate.toDateString() === tomorrow.toDateString();
        });
        break;
      case 'week':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        filteredTasks = this.data.tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= today && taskDate < nextWeek;
        });
        break;
      case 'future':
        const nextWeek2 = new Date(today);
        nextWeek2.setDate(nextWeek2.getDate() + 7);
        filteredTasks = this.data.tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= nextWeek2;
        });
        break;
      case 'all':
      default:
        // 在"全部"选项卡中显示所有任务，包括过去的任务
        filteredTasks = this.data.tasks;
        break;
    }

    // 按日期分组
    const groupedTasks = {};
    const dateHeaders = {};
    filteredTasks.forEach(task => {
      if (!groupedTasks[task.dateStr]) {
        groupedTasks[task.dateStr] = [];
        dateHeaders[task.dateStr] = this.getRelativeDateDescription(task.date);
      }
      groupedTasks[task.dateStr].push(task);
    });

    // 对每个日期组内的任务按时间排序
    Object.keys(groupedTasks).forEach(date => {
      groupedTasks[date].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
    });

    // 对日期进行排序，确保过去的日期显示在前面
    const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    const sortedGroupedTasks = {};
    const sortedDateHeaders = {};
    sortedDates.forEach(date => {
      sortedGroupedTasks[date] = groupedTasks[date];
      sortedDateHeaders[date] = dateHeaders[date];
    });

    this.setData({ 
      groupedTasks: sortedGroupedTasks,
      dateHeaders: sortedDateHeaders,
      filter
    });
  },

  getRelativeDateDescription(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else if (date < today) {
      // 对于过去的日期，显示年月日
      const currentYear = today.getFullYear();
      const dateYear = date.getFullYear();
      if (dateYear === currentYear) {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      } else {
        return `${dateYear}年${date.getMonth() + 1}月${date.getDate()}日`;
      }
    } else if (date < nextWeek) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()];
    } else {
      // 对于未来的日期，也显示年月日
      const currentYear = today.getFullYear();
      const dateYear = date.getFullYear();
      if (dateYear === currentYear) {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      } else {
        return `${dateYear}年${date.getMonth() + 1}月${date.getDate()}日`;
      }
    }
  },

  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    this.filterTasks(filter);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/taskDetail/taskDetail?id=' + id });
  },

  goToAddTask() {
    wx.navigateTo({ url: '/pages/taskForm/taskForm' });
  }
}); 