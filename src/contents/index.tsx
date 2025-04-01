import React, { useEffect, useRef, useState } from "react";
import type { PlasmoCSConfig } from "plasmo";
import Vocab from "../components/vocab";
import PopupWindow from "../components/popupWindow";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
};

// 定义弹窗数据类型
interface PopupData {
  id: string;
  visible: boolean;
  coords: { x: number; y: number; w: number; h: number };
  zIndex: number; // 添加 zIndex 属性控制窗口层级
}

const PopupComponent = () => {
  // 使用数组存储多个弹窗的状态
  const [popups, setPopups] = useState<PopupData[]>([]);
  // 跟踪最高的 zIndex 值
  const [highestZIndex, setHighestZIndex] = useState(2147481000);
  
  // 生成随机位置的函数
  const generateRandomPosition = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    return {
      x: Math.max(100, Math.floor(Math.random() * (screenWidth - 600))),
      y: Math.max(100, Math.floor(Math.random() * (screenHeight - 400))),
      w: 500,
      h: 300
    };
  };

  // 切换弹窗显示状态或创建新弹窗
  const togglePopup = (event: KeyboardEvent) => {
    if (event.metaKey && event.key === ".") {
      // 创建新弹窗
      const newPopupId = `popup-${Date.now()}`;
      const newZIndex = highestZIndex + 1;
      setHighestZIndex(newZIndex);
      console.log(newZIndex);
      const newPopup: PopupData = {
        id: newPopupId,
        visible: true,
        coords: generateRandomPosition(),
        zIndex: newZIndex
      };
      
      setPopups(prevPopups => [...prevPopups, newPopup]);
    }
  };

  // 将窗口置于最前面
  const bringToFront = (popupId: string) => {
    // 使用函数式更新，确保我们总是基于最新的状态值进行更新
    setHighestZIndex(prevZIndex => {
      const newZIndex = prevZIndex + 1;
      
      // 在这里更新 popups 数组，确保使用的是最新的 zIndex 值
      setPopups(prevPopups => 
        prevPopups.map(popup => 
          popup.id === popupId ? { ...popup, zIndex: newZIndex } : popup
        )
      );
      return newZIndex;
    });
  };

  // 关闭指定弹窗
  const closePopup = (popupId: string) => {
    console.log(popups);
    setPopups(prevPopups => 
      prevPopups.map(popup => 
        popup.id === popupId ? { ...popup, visible: false } : popup
      )
    );
  };

  // 移除不可见的弹窗
  useEffect(() => {
    const timer = setTimeout(() => {
      setPopups(prevPopups => prevPopups.filter(popup => popup.visible));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [popups]);

  // 监听快捷键
  useEffect(() => {
    document.addEventListener("keydown", togglePopup);
    return () => document.removeEventListener("keydown", togglePopup);
  }, []);

  // 将窗口恢复到默认 zIndex
  const resetZIndex = (popupId: string) => {
    setPopups(prevPopups => 
      prevPopups.map(popup => 
        popup.id === popupId ? { ...popup, zIndex: 2147481000 } : popup
      )
    );
  };

  return (
    <>
      {popups.map(popup => (
        <PopupWindow 
          key={popup.id}
          visible={popup.visible}
          Coords={popup.coords}
          zIndex={popup.zIndex}
          setPopupVisible={(visible) => {
            if (!visible) closePopup(popup.id);
          }}
          onFocus={() => bringToFront(popup.id)}
          onBlur={() => resetZIndex(popup.id)}
          children={<Vocab />}
        />
      ))}
    </>
  );
};

export default PopupComponent;