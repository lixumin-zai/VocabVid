import React, { useEffect, useState } from "react";
import { APIService } from "../services/requests";

// 定义数据接口
interface OkxItem {
  name: string;
  status: number;
  sell: number;
}

interface OkxResponse {
  code: string;
  data: OkxItem[];
}

const Okx: React.FC = () => {
  const [data, setData] = useState<OkxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'card' | 'row'>('row');

  // 获取 OKX 信息的函数
  const fetchOkxInfo = async () => {
    try {
      setLoading(true);
      const response = await APIService.okxInfo();
      const okxData = response as unknown as OkxResponse;
      
      if (okxData.code === '0' && Array.isArray(okxData.data)) {
        setData(okxData.data);
        setError(null);
      } else {
        setError('数据格式错误');
      }
    } catch (err) {
      console.error("获取 OKX 信息失败:", err);
      setError("获取 OKX 信息失败，请检查网络连接或服务器状态");
    } finally {
      setLoading(false);
      setLastUpdate(new Date().toLocaleTimeString());
    }
  };

  // 组件挂载和自动刷新时获取数据
  useEffect(() => {
    fetchOkxInfo();
    
    // 设置自动刷新
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchOkxInfo();
      }, 1000); // 每 1 秒刷新一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  // 获取值对应的颜色
  const getValueColor = (value: number): string => {
    if (value >= 0) return "#4CAF50"; // 绿色（正值）
    return "#F44336"; // 红色（负值）
  };

  // 渲染 OKX 卡片
  const renderOkxCard = (item: OkxItem, index: number) => {
    return (
      <div 
        key={index}
        style={{
          backgroundColor: "#1E1E1E",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #333"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "18px" }}>
            {item.name}
          </h3>
        </div>
        
        {/* 状态值 */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>状态值</span>
            <span style={{ 
              color: getValueColor(item.status), 
              fontSize: "14px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              {item.status < 0 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill={getValueColor(item.status)}/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14l5-5 5 5z" fill={getValueColor(item.status)}/>
                </svg>
              )}
              {Math.abs(item.status).toFixed(4)}
            </span>
          </div>
        </div>
        
        {/* 卖出值 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>卖出值</span>
            <span style={{ 
              color: getValueColor(item.sell), 
              fontSize: "14px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              {item.sell < 0 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill={getValueColor(item.sell)}/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14l5-5 5 5z" fill={getValueColor(item.sell)}/>
                </svg>
              )}
              {Math.abs(item.sell).toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染行视图的表头
  const renderTableHeader = () => {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "10px",
        padding: "10px 15px",
        backgroundColor: "#1E1E1E",
        borderRadius: "8px 8px 0 0",
        fontWeight: "bold",
        color: "#AAAAAA",
        fontSize: "14px",
        marginBottom: "1px"
      }}>
        <div>名称</div>
        <div>状态值</div>
        <div>卖出值</div>
      </div>
    );
  };

  // 渲染行视图的OKX行
  const renderOkxRow = (item: OkxItem, index: number) => {
    return (
      <div 
        key={index}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          padding: "15px",
          backgroundColor: "#1E1E1E",
          borderRadius: "0",
          marginBottom: "1px",
          alignItems: "center"
        }}
      >
        <div style={{ color: "#FFFFFF" }}>{item.name}</div>
        <div style={{ 
          color: getValueColor(item.status), 
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}>
          {item.status < 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10l5 5 5-5z" fill={getValueColor(item.status)}/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14l5-5 5 5z" fill={getValueColor(item.status)}/>
            </svg>
          )}
          {Math.abs(item.status).toFixed(4)}
        </div>
        <div style={{ 
          color: getValueColor(item.sell), 
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}>
          {item.sell < 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10l5 5 5-5z" fill={getValueColor(item.sell)}/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14l5-5 5 5z" fill={getValueColor(item.sell)}/>
            </svg>
          )}
          {Math.abs(item.sell).toFixed(4)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#121212", 
      borderRadius: "15px",
      color: "white",
      height: "100%",
      overflow: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        {/* <h2 style={{ margin: 0, color: "#FFFFFF" }}>OKX 交易数据</h2> */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setViewMode(viewMode === 'card' ? 'row' : 'card')}
            style={{
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              transition: "background-color 0.3s"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={
                viewMode === 'card' 
                  ? "M3 14h4v-4H3v4zm0 5h4v-4H3v4zM3 9h4V5H3v4zm5 5h13v-4H8v4zm0 5h13v-4H8v4zM8 5v4h13V5H8z" 
                  : "M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"
              } 
              fill="currentColor"/>
            </svg>
            {viewMode === 'card' ? '卡片视图' : '行视图'}
          </button>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              backgroundColor: autoRefresh ? "#4CAF50" : "#333",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              transition: "background-color 0.3s"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
            </svg>
            {autoRefresh ? "自动刷新中" : "自动刷新"}
          </button>
          <button 
            onClick={fetchOkxInfo}
            style={{
              backgroundColor: "#1976D2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              transition: "background-color 0.3s"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 8L15 12H18C18 15.31 15.31 18 12 18C10.99 18 10.03 17.75 9.2 17.3L7.74 18.76C8.97 19.54 10.43 20 12 20C16.42 20 20 16.42 20 12H23L19 8ZM6 12C6 8.69 8.69 6 12 6C13.01 6 13.97 6.25 14.8 6.7L16.26 5.24C15.03 4.46 13.57 4 12 4C7.58 4 4 7.58 4 12H1L5 16L9 12H6Z" fill="currentColor"/>
            </svg>
            刷新
          </button>
        </div>
      </div>
      
      {loading && !data.length && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#AAAAAA" }}>
          <div style={{ marginBottom: "15px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="spin">
              <path d="M12 6V2L8 6H12ZM12 22V18L8 22H12ZM2 12H6L2 8V12ZM18 12H22L18 8V12Z" fill="#AAAAAA">
                <animateTransform 
                  attributeName="transform" 
                  attributeType="XML" 
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
          <div>加载 OKX 数据中...</div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          backgroundColor: "#331111", 
          color: "#FF5555", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #662222"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#FF5555"/>
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {data.length > 0 && (
        <>
          {/* <div style={{ 
            backgroundColor: "#1E1E1E", 
            borderRadius: "8px", 
            padding: "15px", 
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                backgroundColor: "#333", 
                borderRadius: "50%", 
                width: "40px", 
                height: "40px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                flexShrink: 0
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#FFFFFF"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#AAAAAA" }}>交易对数量</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#FFFFFF" }}>{data.length} 个</div>
              </div>
            </div>
            <div style={{ fontSize: "14px", color: "#AAAAAA" }}>
              最后更新: {lastUpdate}
            </div>
          </div> */}
          
          {viewMode === 'card' ? (
            // 卡片视图
            data.map((item, index) => renderOkxCard(item, index))
          ) : (
            // 行视图
            <div style={{ 
              backgroundColor: "#1E1E1E", 
              borderRadius: "8px", 
              overflow: "hidden",
              border: "1px solid #333"
            }}>
              {renderTableHeader()}
              {data.map((item, index) => renderOkxRow(item, index))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Okx;