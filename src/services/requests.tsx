import { getToken } from './authService'

interface ChatResponse {
  content: string
}

interface StreamOptions {
  onChunk: (chunk: string) => void
  onError: (error: Error) => void
}

export class APIService {
  private static readonly BASE_URL = 'http://localhost:20050'
  
  // 获取认证头
  private static async getHeaders(): Promise<HeadersInit> {
    const token = await getToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }

  // 处理流式响应
  private static async handleStreamResponse(
    response: Response,
    options: StreamOptions
  ): Promise<void> {
    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let buffer = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        options.onChunk(buffer)
        buffer = ""
      }
    } catch (error) {
      options.onError(error as Error)
    }
  }

  // 聊天请求
  public static async genExampleSentence(
    content: string,
    options: StreamOptions
  ): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/gen-sentence`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ "words": [content] })
      })

      if (!response.ok) {
        if (response.status === 401) {
            throw new Error('请登陆')
          }
        throw new Error(`未知错误`)
      }

      await this.handleStreamResponse(response, options)
    } catch (error) {
      options.onError(error as Error)
    }
  }

  // 登录请求
  public static async login(username: string, password: string): Promise<string> {
    const response = await fetch(`${this.BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    })

    if (!response.ok) {
      throw new Error(`登录失败: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.access_token) {
      throw new Error('获取 token 失败')
    }

    return data.access_token
  }
}