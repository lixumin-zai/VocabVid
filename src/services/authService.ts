import { Storage } from "@plasmohq/storage"

// 创建存储实例
const storage = new Storage()
const AUTH_KEY = "vocabvid_auth"

// 认证状态接口
export interface AuthState {
  isLoggedIn: boolean;
  username: string;
  token?: string;
}

// 初始化认证状态
export const initAuthState = async (): Promise<void> => {
  const existingAuth = await storage.get(AUTH_KEY)
  if (!existingAuth) {
    // 如果没有，初始化一个空的认证状态
    await storage.set(AUTH_KEY, {
      isLoggedIn: false,
      username: '',
      token: ''
    })
  }
}

// 获取当前认证状态
export const getAuthState = async (): Promise<AuthState> => {
  const authState = await storage.get<AuthState>(AUTH_KEY)
  if (authState) {
    return authState
  }
  return { isLoggedIn: false, username: '' }
}

// 登录并保存认证状态
export const login = async (username: string, token: string): Promise<void> => {
  const authState: AuthState = {
    isLoggedIn: true,
    username,
    token
  }
  await storage.set(AUTH_KEY, authState)
  // 触发自定义事件，通知其他组件登录状态已更改
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: authState }))
}

// 登出并清除认证状态
export const logout = async (): Promise<void> => {
  const authState: AuthState = {
    isLoggedIn: false,
    username: '',
    token: ''
  }
  
  await storage.set(AUTH_KEY, authState)
  
  // 触发自定义事件，通知其他组件登录状态已更改
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: authState }))
}

// 获取认证令牌
export const getToken = async (): Promise<string | undefined> => {
  const authState = await getAuthState()
  return authState.token
}

// 检查是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
  const authState = await getAuthState()
  return authState.isLoggedIn
}

// 添加存储变化监听器
export const addAuthChangeListener = (callback: (newState: AuthState) => void) => {
  // 使用 Plasmo 存储的 watch 功能
  storage.watch({
    [AUTH_KEY]: (newValue) => {
      callback(newValue as AuthState)
    }
  })
  
  // 同时也监听自定义事件
  const handleAuthChange = (event: CustomEvent<AuthState>) => {
    callback(event.detail)
  }
  
  window.addEventListener('auth-state-changed', handleAuthChange as EventListener)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('auth-state-changed', handleAuthChange as EventListener)
    // Plasmo 存储的 watch 会在组件卸载时自动清理
  }
}