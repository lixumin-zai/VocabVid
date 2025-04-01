import React, { useEffect, useRef, useState } from "react";
import ShowSentence from "./showSentences";

interface PopupWindowProps {
  visible: boolean;
  Coords: { x: number; y: number; w: number; h: number };
  zIndex?: number; // 添加可选的 zIndex 属性
  // 用于控制弹窗显示/隐藏的状态设置函数
  setPopupVisible: (value: boolean) => void;
  // 当窗口被点击时调用的函数
  onFocus?: () => void;
  // 当窗口失去焦点时调用的函数
  onBlur?: () => void;
  // 允许接收多个子组件，可以为空
  children?: React.ReactNode;
}

const PopupWindow: React.FC<PopupWindowProps> = ({ 
  visible, 
  Coords, 
  zIndex = 2147481000, // 默认 z-index 值
  setPopupVisible, 
  onFocus,
  onBlur,
  children 
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const startCoords = useRef({ x: 0, y: 0 });
  const popupCoords = useRef(Coords);

  // 当弹窗显示时，聚焦到输入框
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  
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

  // 处理窗口点击事件
  const handleWindowClick = () => {
    setIsFocused(true);
    onFocus();
  };

  // 处理窗口失去焦点事件
  const handleWindowBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "/") {
        // 确保窗口处于焦点状态才响应快捷键
        if (isFocused) {
          setPopupVisible(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setPopupVisible]);

  // 添加全局鼠标事件监听
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle]);

  return (
    <div
      ref={popupRef}
      style={{
        display: visible ? "block" : "none",
        position: "fixed",
        left: popupCoords.current.x,
        top: popupCoords.current.y,
        width: popupCoords.current.w,
        height: popupCoords.current.h,
        zIndex: zIndex,
        backgroundColor: "white",
        padding: "10px",
        border: "2px solid black",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
      onClick={handleWindowClick}
      onBlur={handleWindowBlur}
      tabIndex={0} // 使元素可以接收焦点
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
      <div style={{ 
        padding: "5px 10px",
        height: "calc(100% - 10px)",
        overflow: "auto"
      }}>
        {children}
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

export default PopupWindow;

