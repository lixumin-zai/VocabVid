import { useState, useEffect } from "react"
import { getAuthState, login, logout, initAuthState } from "../utils/authState"

// 样式常量
const styles = {
  container: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    width: "350px",
    height: "500px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    overflow: "auto"
  },
  card: {
    padding: 20,
    width: 300,
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    margin: "0 auto",
    position: "relative" as const,
    overflow: "hidden"
  },
  title: {
    textAlign: "center" as const,
    color: "#333",
    fontSize: "26px",
    marginBottom: "24px",
    fontWeight: "600",
    letterSpacing: "0.5px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    marginBottom: "16px"
  },
  label: {
    fontSize: "15px",
    color: "#555",
    marginBottom: "6px",
    fontWeight: "500" as const
  },
  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(5px)",
    fontSize: "15px",
    transition: "all 0.3s ease",
    outline: "none",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)"
  },
  button: {
    padding: "14px",
    backgroundColor: "#4285f4",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "16px",
    fontWeight: "600" as const,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(66, 133, 244, 0.3)",
    fontSize: "16px"
  },
  logoutButton: {
    padding: "12px 18px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "16px",
    fontWeight: "600" as const,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(244, 67, 54, 0.3)",
    fontSize: "16px"
  },
  error: {
    color: "#e53935",
    margin: "5px 0",
    padding: "10px 14px",
    background: "rgba(229, 57, 53, 0.1)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500" as const
  },
  forgotPassword: {
    textDecoration: "none",
    color: "#4285f4",
    fontSize: "15px",
    transition: "all 0.3s ease",
    textAlign: "center" as const,
    marginTop: "20px",
    display: "block"
  },
  decorCircle1: {
    position: "absolute" as const,
    top: "-60px",
    right: "-60px",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, rgba(66, 133, 244, 0.3), rgba(66, 133, 244, 0.1))",
    zIndex: 0
  },
  decorCircle2: {
    position: "absolute" as const,
    bottom: "-40px",
    left: "-40px",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, rgba(66, 133, 244, 0.2), rgba(66, 133, 244, 0.05))",
    zIndex: 0
  },
  welcomeMessage: {
    textAlign: "center" as const,
    position: "relative" as const,
    zIndex: 1
  }
}

function IndexPopup() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState("")

  // 初始化并加载认证状态
  useEffect(() => {
    initAuthState().then(() => {
      const authState = getAuthState();
      setIsLoggedIn(authState.isLoggedIn);
      if (authState.isLoggedIn) {
        setUsername(authState.username);
      }
    });
  }, []);

  const handleLogin = () => {
    // 这里可以添加实际的登录逻辑，比如API调用
    if (username && password) {
      // 模拟登录成功
      login(username); // 使用全局状态管理的登录函数
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("请输入用户名和密码")
    }
  }

  const handleLogout = () => {
    logout(); // 使用全局状态管理的登出函数
    setIsLoggedIn(false);
    setPassword(""); // 清除密码
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 装饰元素 */}
        <div style={styles.decorCircle1}></div>
        <div style={styles.decorCircle2}></div>
        
        {!isLoggedIn ? (
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={styles.title}>VocabVid 登录</h2>
            
            {error && <p style={styles.error}>{error}</p>}
            
            <div style={styles.inputGroup}>
              <label htmlFor="username" style={styles.label}>用户名</label>
              <input 
                id="username"
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="请输入用户名"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>密码</label>
              <input 
                id="password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="请输入密码"
              />
            </div>
            
            <button 
              onClick={handleLogin}
              style={styles.button}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(66, 133, 244, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(66, 133, 244, 0.3)";
              }}
            >
              登录
            </button>
            
            <a 
              href="#" 
              style={styles.forgotPassword}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#2a75f3";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#4285f4";
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              忘记密码?
            </a>
          </div>
        ) : (
          <div style={styles.welcomeMessage}>
            <h2 style={styles.title}>欢迎回来，{username}!</h2>
            <p style={{ color: "#555", marginBottom: "20px", fontSize: "16px" }}>
              您已成功登录到 VocabVid
            </p>
            <button 
              onClick={handleLogout}
              style={styles.logoutButton}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(244, 67, 54, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(244, 67, 54, 0.3)";
              }}
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexPopup
