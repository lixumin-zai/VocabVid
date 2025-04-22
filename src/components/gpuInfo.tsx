import React, { useEffect, useState } from "react";
import { APIService } from "~services/requests";

// 导入接口定义
interface GpuData {
  index: number;
  name: string;
  driver_version: string;
  temperature: number;
  gpu_utilization: number;
  memory_utilization: number;
  total_memory: number;
  free_memory: number;
  used_memory: number;
}

interface GpuResponse {
  status: string;
  gpu_count: number;
  gpus: GpuData[];
}

interface GpuInfoProps {
  gpuInfoUrl?: string;
}

const GpuInfo: React.FC<GpuInfoProps> = () => {
  const [gpuData, setGpuData] = useState<GpuResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'card' | 'row' | 'grid'>('grid'); // 添加网格视图模式

  // 获取 GPU 信息的函数
  const fetchGpuInfo = async () => {
    try {
      setLoading(true);
      const data = await APIService.fetchGpuInfo();
      console.log("GPU 信息:", data);
      setGpuData(data);
      setError(null);
    } catch (err) {
      console.error("获取 GPU 信息失败:", err);
      setError("获取 GPU 信息失败，请检查网络连接或服务器状态");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载和自动刷新时获取数据
  useEffect(() => {
    fetchGpuInfo();
    
    // 设置自动刷新
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchGpuInfo();
      }, 2000); // 每 2 秒刷新一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  // 格式化内存大小（转换为 GB）
  const formatMemory = (memory: number): string => {
    return (memory / 1024).toFixed(2) + " GB";
  };

  // 获取温度对应的颜色
  const getTemperatureColor = (temp: number): string => {
    if (temp < 50) return "#4CAF50"; // 绿色
    if (temp < 70) return "#FFC107"; // 黄色
    return "#F44336"; // 红色
  };

  // 获取利用率对应的颜色
  const getUtilizationColor = (utilization: number): string => {
    if (utilization < 30) return "#4CAF50"; // 绿色
    if (utilization < 70) return "#FFC107"; // 黄色
    return "#F44336"; // 红色
  };

  // 渲染 GPU 卡片
  const renderGpuCard = (gpu: GpuData) => {
    const memoryUsagePercent = (gpu.used_memory / gpu.total_memory) * 100;
    
    return (
      <div 
        key={gpu.index}
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
            {gpu.name} (GPU {gpu.index})
          </h3>
          <div 
            style={{ 
              backgroundColor: getTemperatureColor(gpu.temperature),
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#000"
            }}
          >
            {gpu.temperature}°C
          </div>
        </div>
        
        <div style={{ color: "#AAAAAA", fontSize: "14px", marginBottom: "15px" }}>
          驱动版本: {gpu.driver_version}
        </div>
        
        {/* GPU 利用率 */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>GPU 利用率</span>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>{gpu.gpu_utilization.toFixed(1)}%</span>
          </div>
          <div style={{ 
            height: "8px", 
            backgroundColor: "#333333", 
            borderRadius: "4px", 
            overflow: "hidden" 
          }}>
            <div style={{ 
              width: `${gpu.gpu_utilization}%`, 
              height: "100%", 
              backgroundColor: getUtilizationColor(gpu.gpu_utilization),
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
        
        {/* 内存利用率 */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>内存利用率</span>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>{gpu.memory_utilization.toFixed(1)}%</span>
          </div>
          <div style={{ 
            height: "8px", 
            backgroundColor: "#333333", 
            borderRadius: "4px", 
            overflow: "hidden" 
          }}>
            <div style={{ 
              width: `${gpu.memory_utilization}%`, 
              height: "100%", 
              backgroundColor: getUtilizationColor(gpu.memory_utilization),
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
        
        {/* 内存使用情况 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>内存使用</span>
            <span style={{ color: "#DDDDDD", fontSize: "14px" }}>
              {formatMemory(gpu.used_memory)} / {formatMemory(gpu.total_memory)}
            </span>
          </div>
          <div style={{ 
            height: "8px", 
            backgroundColor: "#333333", 
            borderRadius: "4px", 
            overflow: "hidden" 
          }}>
            <div style={{ 
              width: `${memoryUsagePercent}%`, 
              height: "100%", 
              backgroundColor: getUtilizationColor(memoryUsagePercent),
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }} />
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
        gridTemplateColumns: "50px 200px 120px 100px 120px 120px 180px",
        gap: "10px",
        padding: "10px 15px",
        backgroundColor: "#1E1E1E",
        borderRadius: "8px 8px 0 0",
        fontWeight: "bold",
        color: "#AAAAAA",
        fontSize: "14px",
        marginBottom: "1px"
      }}>
        <div>ID</div>
        <div>名称</div>
        <div>温度</div>
        <div>GPU使用率</div>
        <div>内存使用率</div>
        <div>驱动版本</div>
        <div>内存使用</div>
      </div>
    );
  };

  // 渲染行视图的GPU行
  const renderGpuRow = (gpu: GpuData) => {
    const memoryUsagePercent = (gpu.used_memory / gpu.total_memory) * 100;
    
    return (
      <div 
        key={gpu.index}
        style={{
          display: "grid",
          gridTemplateColumns: "50px 200px 120px 100px 120px 120px 180px",
          gap: "10px",
          padding: "15px",
          backgroundColor: "#1E1E1E",
          borderRadius: "0",
          marginBottom: "1px",
          alignItems: "center"
        }}
      >
        <div style={{ color: "#FFFFFF", fontWeight: "bold" }}>{gpu.index}</div>
        <div style={{ color: "#FFFFFF" }}>{gpu.name}</div>
        <div>
          <div 
            style={{ 
              backgroundColor: getTemperatureColor(gpu.temperature),
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#000",
              display: "inline-block",
              textAlign: "center",
              minWidth: "60px"
            }}
          >
            {gpu.temperature}°C
          </div>
        </div>
        <div>
          <div style={{ 
            height: "8px", 
            backgroundColor: "#333333", 
            borderRadius: "4px", 
            overflow: "hidden",
            marginBottom: "4px"
          }}>
            <div style={{ 
              width: `${gpu.gpu_utilization}%`, 
              height: "100%", 
              backgroundColor: getUtilizationColor(gpu.gpu_utilization),
              borderRadius: "4px"
            }} />
          </div>
          <div style={{ color: "#DDDDDD", fontSize: "12px" }}>{gpu.gpu_utilization.toFixed(1)}%</div>
        </div>
        <div>
          <div style={{ 
            height: "8px", 
            backgroundColor: "#333333", 
            borderRadius: "4px", 
            overflow: "hidden",
            marginBottom: "4px"
          }}>
            <div style={{ 
              width: `${gpu.memory_utilization}%`, 
              height: "100%", 
              backgroundColor: getUtilizationColor(gpu.memory_utilization),
              borderRadius: "4px"
            }} />
          </div>
          <div style={{ color: "#DDDDDD", fontSize: "12px" }}>{gpu.memory_utilization.toFixed(1)}%</div>
        </div>
        <div style={{ color: "#AAAAAA", fontSize: "14px" }}>{gpu.driver_version}</div>
        <div style={{ color: "#DDDDDD", fontSize: "14px" }}>
          {formatMemory(gpu.used_memory)} / {formatMemory(gpu.total_memory)}
        </div>
      </div>
    );
  };

  // 渲染网格视图的GPU卡片
  const renderGpuGridCard = (gpu: GpuData) => {
    const memoryUsagePercent = (gpu.used_memory / gpu.total_memory) * 100;
    
    return (
      <div 
        key={gpu.index}
        style={{
          backgroundColor: "#1E1E1E",
          borderRadius: "12px",
          padding: "15px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #333",
          width: "calc(25% - 15px)",
          minWidth: "220px",
          aspectRatio: "1/1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              GPU {gpu.index}
            </h3>
            <div 
              style={{ 
                backgroundColor: getTemperatureColor(gpu.temperature),
                padding: "3px 8px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#000"
              }}
            >
              {gpu.temperature}°C
            </div>
          </div>
          
          <div style={{ color: "#FFFFFF", fontSize: "14px", marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {gpu.name}
          </div>
          
          <div style={{ color: "#AAAAAA", fontSize: "12px", marginBottom: "10px" }}>
            驱动: {gpu.driver_version}
          </div>
        </div>
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "15px" }}>
          {/* GPU 利用率 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ color: "#DDDDDD", fontSize: "12px" }}>GPU</span>
              <span style={{ color: "#DDDDDD", fontSize: "12px" }}>{gpu.gpu_utilization.toFixed(1)}%</span>
            </div>
            <div style={{ 
              height: "6px", 
              backgroundColor: "#333333", 
              borderRadius: "3px", 
              overflow: "hidden" 
            }}>
              <div style={{ 
                width: `${gpu.gpu_utilization}%`, 
                height: "100%", 
                backgroundColor: getUtilizationColor(gpu.gpu_utilization),
                borderRadius: "3px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
          
          {/* 内存利用率 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ color: "#DDDDDD", fontSize: "12px" }}>内存</span>
              <span style={{ color: "#DDDDDD", fontSize: "12px" }}>{gpu.memory_utilization.toFixed(1)}%</span>
            </div>
            <div style={{ 
              height: "6px", 
              backgroundColor: "#333333", 
              borderRadius: "3px", 
              overflow: "hidden" 
            }}>
              <div style={{ 
                width: `${gpu.memory_utilization}%`, 
                height: "100%", 
                backgroundColor: getUtilizationColor(gpu.memory_utilization),
                borderRadius: "3px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        </div>
        
        {/* 内存使用情况 */}
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#DDDDDD", fontSize: "12px" }}>显存使用</span>
            <span style={{ color: "#DDDDDD", fontSize: "12px" }}>
              {formatMemory(gpu.used_memory)} / {formatMemory(gpu.total_memory)}
            </span>
          </div>
          <div style={{ 
            height: "6px", 
            backgroundColor: "#333333", 
            borderRadius: "3px", 
            overflow: "hidden" 
          }}>
            <div style={{ 
              width: `${memoryUsagePercent}%`, 
              height: "100%", 
              backgroundColor: getUtilizationColor(memoryUsagePercent),
              borderRadius: "3px",
              transition: "width 0.3s ease"
            }} />
          </div>
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
        <h2 style={{ margin: 0, color: "#FFFFFF" }}>GPU 监控</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => {
              const modes = ['grid', 'card', 'row'];
              const currentIndex = modes.indexOf(viewMode);
              const nextIndex = (currentIndex + 1) % modes.length;
              setViewMode(modes[nextIndex] as 'grid' | 'card' | 'row');
            }}
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
                viewMode === 'grid' 
                  ? "M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"
                  : viewMode === 'card' 
                    ? "M3 14h4v-4H3v4zm0 5h4v-4H3v4zM3 9h4V5H3v4zm5 5h13v-4H8v4zm0 5h13v-4H8v4zM8 5v4h13V5H8z" 
                    : "M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"
              } 
              fill="currentColor"/>
            </svg>
            {viewMode === 'grid' ? '网格视图' : viewMode === 'card' ? '卡片视图' : '行视图'}
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
            onClick={fetchGpuInfo}
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
      
      {loading && !gpuData && (
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
          <div>加载 GPU 信息中...</div>
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
      
      {gpuData && (
        <>
          {/* <div style={{ 
            backgroundColor: "#1E1E1E", 
            borderRadius: "8px", 
            padding: "15px", 
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
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
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM12 6C9.24 6 7 8.24 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 8.24 14.76 6 12 6ZM12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14Z" fill="#FFFFFF"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#AAAAAA" }}>可用 GPU</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#FFFFFF" }}>{gpuData.gpu_count} 个设备</div>
            </div>
          </div> */}
          
          {viewMode === 'grid' ? (
            // 网格视图 - 每行最多4个正方形卡片
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "20px",
              justifyContent: "flex-start"
            }}>
              {gpuData.gpus.map(gpu => renderGpuGridCard(gpu))}
            </div>
          ) : viewMode === 'card' ? (
            // 卡片视图
            gpuData.gpus.map(gpu => renderGpuCard(gpu))
          ) : (
            // 行视图
            <div style={{ 
              backgroundColor: "#1E1E1E", 
              borderRadius: "8px", 
              overflow: "hidden",
              border: "1px solid #333"
            }}>
              {renderTableHeader()}
              {gpuData.gpus.map(gpu => renderGpuRow(gpu))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GpuInfo;