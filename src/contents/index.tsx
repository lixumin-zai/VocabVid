import React, { useEffect, useRef, useState } from "react";
import type { PlasmoCSConfig } from "plasmo";
import ShowSentence from "../components/showSentences";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
};

const PopupComponent = () => {
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [markdownText, setMarkdownText] = useState("");
  const [showMarkdownTable, setShowMarkdownTable] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  
  const startCoords = useRef({ x: 0, y: 0 });
  const popupCoords = useRef({ x: 100, y: 100, w: 500, h: 300 });

  // 切换弹窗显示状态
  const togglePopup = (event: KeyboardEvent) => {
    if (event.metaKey && event.key === ".") {
      setPopupVisible(!popupVisible);
      // 当弹窗显示时，聚焦到输入框
      if (!popupVisible && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  // 监听快捷键
  useEffect(() => {
    document.addEventListener("keydown", togglePopup);
    return () => document.removeEventListener("keydown", togglePopup);
  }, [popupVisible]);

  // 开始拖拽
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startCoords.current = { x: e.clientX, y: e.clientY };
  };

  // 开始缩放
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
    startCoords.current = { x: e.clientX, y: e.clientY };
  };

  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && popupRef.current) {
      const dx = e.clientX - startCoords.current.x;
      const dy = e.clientY - startCoords.current.y;
      popupCoords.current.x += dx;
      popupCoords.current.y += dy;
      popupRef.current.style.left = `${popupCoords.current.x}px`;
      popupRef.current.style.top = `${popupCoords.current.y}px`;
      startCoords.current = { x: e.clientX, y: e.clientY };
    }
    
    if (isResizing && popupRef.current) {
      const dx = e.clientX - startCoords.current.x;
      const dy = e.clientY - startCoords.current.y;
      
      switch (resizeHandle) {
        case "br":
          popupCoords.current.w += dx;
          popupCoords.current.h += dy;
          break;
        case "bl":
          popupCoords.current.x += dx;
          popupCoords.current.w -= dx;
          popupCoords.current.h += dy;
          break;
        case "tr":
          popupCoords.current.y += dy;
          popupCoords.current.w += dx;
          popupCoords.current.h -= dy;
          break;
        case "tl":
          popupCoords.current.x += dx;
          popupCoords.current.y += dy;
          popupCoords.current.w -= dx;
          popupCoords.current.h -= dy;
          break;
      }
      
      popupRef.current.style.left = `${popupCoords.current.x}px`;
      popupRef.current.style.top = `${popupCoords.current.y}px`;
      popupRef.current.style.width = `${Math.max(200, popupCoords.current.w)}px`;
      popupRef.current.style.height = `${Math.max(100, popupCoords.current.h)}px`;
      startCoords.current = { x: e.clientX, y: e.clientY };
    }
  };

  // 处理鼠标释放
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      // 尝试解析 Markdown 表格
      if (inputValue.includes("|原文分词|译文完全对应词|具体解释|")) {
        setMarkdownText(inputValue);
        setShowMarkdownTable(true);
      } else {
        setShowMarkdownTable(false);
        handleStreamRequest(inputValue);
      }
      setInputValue("");
    }
  };

  // 处理流式请求
  const handleStreamRequest = async (content: string) => {
    if (!outputRef.current) return;
    
    outputRef.current.innerHTML = ""; // 清空之前的输出
    
    try {
      const url = "https://lismin.online:10002/chat";
      const data = { content };
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error("Response body is null");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        outputRef.current.innerHTML += buffer;
        buffer = "";
        
        // 自动滚动到底部
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("请求出错:", error);
      if (outputRef.current) {
        outputRef.current.innerHTML += `<div style="color: red;">请求出错: ${error.message}</div>`;
      }
    }
  };

  // 在返回的JSX中，将id="stream-output"改为ref={outputRef}
  return (
    <div
      ref={popupRef}
      style={{
        display: popupVisible ? "block" : "none",
        position: "fixed",
        left: popupCoords.current.x,
        top: popupCoords.current.y,
        width: popupCoords.current.w,
        height: popupCoords.current.h,
        zIndex: 2147483645,
        backgroundColor: "white",
        padding: "10px",
        border: "2px solid black",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* 拖拽区域 */}
      <div 
        id="drag-header-top" 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: "10px", 
          cursor: "move",
          backgroundColor: "rgba(255, 0, 0, 0.05)",
          zIndex: 10
        }}
        onMouseDown={handleDragStart}
      ></div>
      <div 
        id="drag-header-bottom" 
        style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: "10px", 
          cursor: "move",
          backgroundColor: "rgba(255, 0, 0, 0.05)",
          zIndex: 10
        }}
        onMouseDown={handleDragStart}
      ></div>
      <div 
        id="drag-header-left" 
        style={{ 
          position: "absolute", 
          left: 0, 
          top: 0, 
          bottom: 0, 
          width: "10px", 
          cursor: "move",
          backgroundColor: "rgba(255, 0, 0, 0.05)",
          zIndex: 10
        }}
        onMouseDown={handleDragStart}
      ></div>
      <div 
        id="drag-header-right" 
        style={{ 
          position: "absolute", 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: "10px", 
          cursor: "move",
          backgroundColor: "rgba(255, 0, 0, 0.05)",
          zIndex: 10
        }}
        onMouseDown={handleDragStart}
      ></div>
      
      {/* 内容区域 */}
      <div style={{ padding: "15px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          marginBottom: "10px",
          marginTop: "5px"
        }}>
          <input 
            ref={inputRef}
            type="text" 
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入内容或粘贴Markdown表格" 
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: "16px",
              border: "1px solid #dcdfe6",
              borderRadius: "8px",
              color: "white",
              backgroundColor: "black",
              outline: "none"
            }}
          />
          <button 
            onClick={() => {
              if (inputValue.trim()) {
                // 检查是否为Markdown表格
                if (inputValue.includes("|原文分词|译文完全对应词|具体解释|")) {
                  setMarkdownText(inputValue);
                  setShowMarkdownTable(true);
                } else {
                  setShowMarkdownTable(false);
                  handleStreamRequest(inputValue);
                }
                setInputValue("");
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#409eff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            发送
          </button>
        </div>
        
        <div 
          style={{ 
            color: "black", 
            whiteSpace: "pre-wrap",
            flex: 1,
            overflow: "auto",
            padding: "10px",
            backgroundColor: "#f5f7fa",
            borderRadius: "8px"
          }}
        >
          {showMarkdownTable ? (
            <ShowSentence markdownText={markdownText} />
          ) : (
            <div ref={outputRef}></div>
          )}
        </div>
      </div>
      
    {/* 缩放手柄 */}
    <div 
        id="resize-br" 
        style={{ 
          position: "absolute", 
          bottom: 0, 
          right: 0, 
          width: "20px", 
          height: "20px", 
          cursor: "nwse-resize",
          backgroundColor: "rgba(0, 0, 0, 0.01)",
          zIndex: 20
        }}
        onMouseDown={(e) => handleResizeStart(e, "br")}
      ></div>
      <div 
        id="resize-bl" 
        style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          width: "20px", 
          height: "20px", 
          cursor: "nesw-resize",
          backgroundColor: "rgba(0, 0, 0, 0.01)",
          zIndex: 20
        }}
        onMouseDown={(e) => handleResizeStart(e, "bl")}
      ></div>
      <div 
        id="resize-tr" 
        style={{ 
          position: "absolute", 
          top: 0, 
          right: 0, 
          width: "20px", 
          height: "20px", 
          cursor: "nesw-resize",
          backgroundColor: "rgba(0, 0, 0, 0.01)",
          zIndex: 20
        }}
        onMouseDown={(e) => handleResizeStart(e, "tr")}
      ></div>
      <div 
        id="resize-tl" 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "20px", 
          height: "20px", 
          cursor: "nwse-resize",
          backgroundColor: "rgba(0, 0, 0, 0.01)",
          zIndex: 20
        }}
        onMouseDown={(e) => handleResizeStart(e, "tl")}
      ></div>
    </div>
  );
};

export default PopupComponent;