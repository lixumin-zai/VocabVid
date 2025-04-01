import React, { useEffect, useRef, useState } from "react";
import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
};

// 添加 ShowSentence 组件
interface TableItem {
  original: string;
  translation: string;
  explanation: string;
}

const ShowSentence: React.FC<{ markdownText: string }> = ({ markdownText }) => {
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parseMarkdownTable();
  }, [markdownText]);

  const parseMarkdownTable = () => {
    try {
      // 分割文本为行 - 尝试多种分隔符
      const lines = markdownText.includes("\\n") 
        ? markdownText.split("\\n") 
        : markdownText.split("\n");
      
      const result: TableItem[] = [];
  
      // 查找表头行的索引
      const headerIndex = lines.findIndex(line => 
        line.includes("|原文分词|译文完全对应词|具体解释|"));
      
      if (headerIndex === -1) {
        throw new Error("找不到表头");
      }
      
      // 跳过表头和分隔行
      for (let i = headerIndex + 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || !line.startsWith("|") || !line.endsWith("|")) continue;
        
        // 分割单元格
        const cells = line.split("|").filter(cell => cell.trim() !== "");
        if (cells.length >= 3) {
          result.push({
            original: cells[0].trim(),
            translation: cells[1].trim(),
            explanation: cells[2].trim()
          });
        }
      }
      
      setTableData(result);
    } catch (error) {
      console.error("解析表格出错:", error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div style="color: red;">解析表格出错: ${error.message}</div>`;
      }
    }
  };

  // 渲染句子部分
  const renderSentence = () => {
    if (tableData.length === 0) return null;

    // 构建原始句子文本
    const originalSentence = tableData.map(item => item.original).join(' ');

    // 复制句子到剪贴板
    const handleCopy = () => {
      navigator.clipboard.writeText(originalSentence)
        .then(() => {
          // 显示复制成功提示
          const copyBtn = document.getElementById('copy-sentence-btn');
          if (copyBtn) {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = '已复制!';
            copyBtn.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
              copyBtn.innerText = originalText;
              copyBtn.style.backgroundColor = '#1a73e8';
            }, 2000);
          }
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    };

    return (
      <div style={{
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        marginBottom: "15px",
        fontSize: "16px",
        lineHeight: "1.6",
        position: "relative" // 添加相对定位以便放置复制按钮
      }}>
        <p>
          {tableData.map((item, index) => {
            const translationElement = item.translation !== "-" ? (
              <span style={{ fontWeight: "bold", color: "#0f9d58" }}>
                {item.translation}
              </span>
            ) : null;

            return (
              <React.Fragment key={index}>
                {index > 0 && " "}
                <span 
                  className="vocab-word" 
                  style={{
                    fontWeight: "bold", 
                    color: "#1a73e8", 
                    position: "relative", 
                    cursor: "help", 
                    transition: "background-color 0.2s ease"
                  }}
                  data-explanation={item.explanation}
                  data-translation={item.translation !== '-' ? item.translation : ''}
                  onMouseEnter={(e) => handleWordHover(e)}
                  onMouseLeave={(e) => handleWordLeave(e)}
                >
                  {item.original}
                  {/* {translationElement && (
                    <>(
                      {translationElement}
                    )</>
                  )} */}
                </span>
              </React.Fragment>
            );
          })}
        </p>
        
        {/* 添加复制按钮 */}
        <button
          id="copy-sentence-btn"
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#1a73e8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "5px 10px",
            fontSize: "12px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
          </svg>
          复制
        </button>
      </div>
    );
  };

  // 处理单词悬停
  const handleWordHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget;
    target.style.backgroundColor = '#e8f0fe';
    
    const explanation = target.getAttribute('data-explanation') || '';
    const translation = target.getAttribute('data-translation') || '';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'vocab-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#333';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px'; // 增大字体大小，提高可读性
    tooltip.style.zIndex = '1000';
    tooltip.style.width = 'max-content';
    tooltip.style.maxWidth = '300px';
    tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.textAlign = 'left';
    tooltip.style.lineHeight = '1.4';
    
    // 先添加内容
    tooltip.innerHTML = `
      ${translation ? `<div style="font-weight: bold; margin-bottom: 4px; color: #0f9d58; font-size: 13px;">${translation}</div>` : ''}
      <div style="font-size: 12px;">${explanation}</div>
    `;
    
    // 先添加到DOM以获取尺寸
    target.appendChild(tooltip);
    
    // 计算最佳位置
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || document.body.getBoundingClientRect();
    
    // 默认显示在上方
    let position = 'top';
    
    // 检查上方空间是否足够
    if (targetRect.top - tooltipRect.height < containerRect.top) {
      position = 'bottom';
    }
    
    // 计算水平位置
    let arrowLeftPosition = '50%';
    let horizontalAlignment = 'center';
    
    if (tooltipRect.width > containerRect.width) {
      // 如果提示框比容器还宽，则左对齐到容器边缘
      horizontalAlignment = 'left';
    } else {
      // 检查是否会超出左边界
      if (targetRect.left + (tooltipRect.width / 2) > containerRect.right) {
        // 会超出右边界
        horizontalAlignment = 'right';
      } else if (targetRect.left - (tooltipRect.width / 2) < containerRect.left) {
        // 会超出左边界
        horizontalAlignment = 'left';
      }
    }
    
    // 根据位置设置样式
    if (position === 'top') {
      tooltip.style.bottom = '100%';
      tooltip.style.top = 'auto';
      tooltip.style.marginBottom = '5px';
      
      // 根据水平对齐方式设置
      if (horizontalAlignment === 'center') {
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        arrowLeftPosition = '50%';
      } else if (horizontalAlignment === 'left') {
        tooltip.style.left = '0';
        tooltip.style.transform = 'none';
        // 计算箭头位置：单词中心相对于提示框左边缘的位置
        arrowLeftPosition = `${targetRect.width / 2}px`;
      } else { // right
        tooltip.style.right = '0';
        tooltip.style.left = 'auto';
        tooltip.style.transform = 'none';
        // 计算箭头位置：单词中心相对于提示框右边缘的位置
        arrowLeftPosition = `calc(100% - ${targetRect.width / 2}px)`;
      }
      
      // 添加小三角
      const arrow = document.createElement('div');
      arrow.style.position = 'absolute';
      arrow.style.bottom = '-5px';
      arrow.style.left = arrowLeftPosition;
      arrow.style.transform = 'translateX(-50%)';
      arrow.style.width = '0';
      arrow.style.height = '0';
      arrow.style.borderLeft = '5px solid transparent';
      arrow.style.borderRight = '5px solid transparent';
      arrow.style.borderTop = '5px solid #333';
      tooltip.appendChild(arrow);
      
    } else { // bottom
      tooltip.style.top = '100%';
      tooltip.style.bottom = 'auto';
      tooltip.style.marginTop = '5px';
      
      // 根据水平对齐方式设置
      if (horizontalAlignment === 'center') {
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        arrowLeftPosition = '50%';
      } else if (horizontalAlignment === 'left') {
        tooltip.style.left = '0';
        tooltip.style.transform = 'none';
        arrowLeftPosition = `${targetRect.width / 2}px`;
      } else { // right
        tooltip.style.right = '0';
        tooltip.style.left = 'auto';
        tooltip.style.transform = 'none';
        arrowLeftPosition = `calc(100% - ${targetRect.width / 2}px)`;
      }
      
      // 添加小三角
      const arrow = document.createElement('div');
      arrow.style.position = 'absolute';
      arrow.style.top = '-5px';
      arrow.style.left = arrowLeftPosition;
      arrow.style.transform = 'translateX(-50%)';
      arrow.style.width = '0';
      arrow.style.height = '0';
      arrow.style.borderLeft = '5px solid transparent';
      arrow.style.borderRight = '5px solid transparent';
      arrow.style.borderBottom = '5px solid #333';
      tooltip.appendChild(arrow);
    }
  };

  // 处理单词鼠标离开
  const handleWordLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget;
    target.style.backgroundColor = 'transparent';
    
    const tooltip = target.querySelector('.vocab-tooltip');
    if (tooltip) {
      target.removeChild(tooltip);
    }
  };

  // 渲染统计信息
  const renderSummary = () => {
    if (tableData.length === 0) return null;

    return (
      <div style={{
        marginTop: "15px",
        padding: "10px",
        backgroundColor: "#f8f9fa",
        borderRadius: "5px",
        color: "#666",
        fontSize: "14px",
        textAlign: "center"
      }}>
        <p>共解析出 {tableData.length} 个词条，其中有译文的词条 {tableData.filter(r => r.translation !== "-").length} 个</p>
      </div>
    );
  };

  return (
    <div ref={containerRef}>
      {renderSentence()}
      {renderSummary()}
    </div>
  );
};

export default ShowSentence;