// 创建一个简单的全局状态管理

interface AuthState {
  isLoggedIn: boolean;
  username: string;
}

// 初始状态
const state: AuthState = {
  isLoggedIn: false,
  username: ""
};

// 监听器列表
const listeners: Array<(state: AuthState) => void> = [];

// 获取当前状态
export const getAuthState = (): AuthState => {
  return { ...state };
};

// 设置状态
export const setAuthState = (newState: Partial<AuthState>): void => {
  Object.assign(state, newState);
  
  // 通知所有监听器
  listeners.forEach(listener => listener(getAuthState()));
  
  // 同时保存到 Chrome Storage 以便在不同页面间共享
  chrome.storage.local.set(newState);
};

// 添加状态变化监听器
export const subscribeToAuth = (listener: (state: AuthState) => void): () => void => {
  listeners.push(listener);
  
  // 立即调用一次监听器，传入当前状态
  listener(getAuthState());
  
  // 返回取消订阅函数
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// 初始化 - 从 Chrome Storage 加载状态
export const initAuthState = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isLoggedIn', 'username'], (result) => {
      if (result.isLoggedIn) {
        Object.assign(state, {
          isLoggedIn: result.isLoggedIn,
          username: result.username || ""
        });
      }
      resolve();
    });
  });
};

// 登录
export const login = (username: string): void => {
  setAuthState({
    isLoggedIn: true,
    username
  });
};

// 登出
export const logout = (): void => {
  setAuthState({
    isLoggedIn: false,
    username: ""
  });
};