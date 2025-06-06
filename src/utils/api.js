// API基础URL
const API_BASE_URL = '/api';

// 获取存储的令牌
const getToken = () => {
  return localStorage.getItem('couple_scheduler_token');
};

// 设置令牌
const setToken = (token) => {
  localStorage.setItem('couple_scheduler_token', token);
};

// 清除令牌
const clearToken = () => {
  localStorage.removeItem('couple_scheduler_token');
};

// 通用请求函数
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`发送请求到: ${url}`, options);
  
  // 默认请求头
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // 如果有令牌，添加到请求头
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('使用令牌:', token);
  }
  
  // 请求配置
  const config = {
    ...options,
    headers
  };
  
  console.log('请求配置:', config);
  
  try {
    console.log('开始发送请求...');
    const response = await fetch(url, config);
    console.log('收到响应:', response.status, response.statusText);
    
    // 如果响应不成功
    if (!response.ok) {
      console.error('响应不成功:', response.status, response.statusText);
      
      // 如果是401错误，清除令牌
      if (response.status === 401) {
        console.log('认证失败，清除令牌');
        clearToken();
      }
      
      // 解析错误响应
      try {
        const errorData = await response.json();
        console.error('错误响应数据:', errorData);
        throw new Error(errorData.detail || '请求失败');
      } catch (jsonError) {
        console.error('解析错误响应失败:', jsonError);
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }
    }
    
    // 如果响应是204 No Content
    if (response.status === 204) {
      console.log('响应无内容');
      return null;
    }
    
    // 解析响应数据
    try {
      const data = await response.json();
      console.log('响应数据:', data);
      return data;
    } catch (jsonError) {
      console.error('解析响应数据失败:', jsonError);
      throw new Error('解析响应数据失败');
    }
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 用户API
export const userApi = {
  // 注册
  register: (userData) => {
    return request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // 登录
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/users/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '登录失败');
    }
    
    const data = await response.json();
    setToken(data.access_token);
    return data;
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return request('/users/me');
  },
  
  // 更新用户信息
  updateUser: (userData) => {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },
  
  // 根据用户名查找用户
  findUserByUsername: (username) => {
    return request(`/users/find?username=${encodeURIComponent(username)}`);
  },
  
  // 登出
  logout: () => {
    clearToken();
  }
};

// 情侣关系API
export const coupleApi = {
  // 创建情侣关系
  createCouple: (coupleData) => {
    return request('/couples', {
      method: 'POST',
      body: JSON.stringify(coupleData)
    });
  },
  
  // 获取情侣关系
  getCouple: () => {
    return request('/couples');
  },
  
  // 获取伴侣信息
  getPartner: () => {
    return request('/couples/partner');
  },
  
  // 删除情侣关系
  deleteCouple: () => {
    return request('/couples', {
      method: 'DELETE'
    });
  }
};

// 任务API
export const taskApi = {
  // 创建任务
  createTask: (taskData) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },
  
  // 获取任务列表
  getTasks: (period, completed) => {
    let url = '/tasks';
    const params = [];
    
    if (period) {
      params.push(`period=${period}`);
    }
    
    if (completed !== undefined) {
      params.push(`completed=${completed}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return request(url);
  },
  
  // 获取单个任务
  getTask: (taskId) => {
    return request(`/tasks/${taskId}`);
  },
  
  // 更新任务
  updateTask: (taskId, taskData) => {
    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },
  
  // 删除任务
  deleteTask: (taskId) => {
    return request(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }
};