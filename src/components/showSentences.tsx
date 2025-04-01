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

  // 添加清理函数，确保组件卸载时移除所有气泡
  useEffect(() => {
    return () => {
      const allTooltips = document.querySelectorAll('.vocab-tooltip');
      allTooltips.forEach(tooltip => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      });
    };
  }, []);

  // 渲染句子部分
  const renderSentence = () => {
    if (tableData.length === 0) return null;

    // 构建原始句子文本
    const originalSentence = tableData.map(item => item.original).join(' ');

    // 构建中文翻译映射表
    const translationMap = new Map<string, string[]>();
    tableData.forEach(item => {
      if (item.translation && item.translation !== '-') {
        if (!translationMap.has(item.translation)) {
          translationMap.set(item.translation, []);
        }
        translationMap.get(item.translation)?.push(item.original);
      }
    });

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
            }, 4000);
          }
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    };

    // 提取中文翻译句子 - 修改这部分
    const processedText = markdownText.replace(/\\n/g, '\n');
    const lines = processedText.split('\n');
    
    const chineseTranslationLine = lines.find(line => 
      line.startsWith('**中文翻译**'));
    
    const chineseTranslation = chineseTranslationLine 
      ? lines[lines.indexOf(chineseTranslationLine) + 1] 
      : '';
        
    return (
      <div style={{
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        marginBottom: "15px",
        fontSize: "16px",
        lineHeight: "1.6",
        position: "relative"
      }}>
        {/* 英文原句 */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>原句</h3>
          <p>
            {tableData.map((item, index) => (
              <React.Fragment key={`en-${index}`}>
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
                </span>
              </React.Fragment>
            ))}
          </p>
        </div>
        
        {/* 中文翻译 */}
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>中文翻译</h3>
          <p>
            {chineseTranslation.split(/(?<=[\u4e00-\u9fa5])(?![\u4e00-\u9fa5])|(?![\u4e00-\u9fa5])(?=[\u4e00-\u9fa5])/).map((word, index) => {
              // 检查是否是中文词语
              const isChinese = /[\u4e00-\u9fa5]/.test(word);
              const matchedEnglishWords = isChinese && translationMap.has(word) ? translationMap.get(word) : null;
              
              if (isChinese && matchedEnglishWords && matchedEnglishWords.length > 0) {
                // 查找对应的英文单词的解释
                const englishWord = matchedEnglishWords[0];
                const item = tableData.find(item => item.original === englishWord);
                
                return (
                  <span 
                    key={`cn-${index}`}
                    className="vocab-word-cn" 
                    style={{
                      fontWeight: "bold", 
                      color: "#0f9d58", 
                      position: "relative", 
                      cursor: "help", 
                      transition: "background-color 0.2s ease"
                    }}
                    data-english={matchedEnglishWords.join(', ')}
                    data-explanation={item?.explanation || ''}
                    onMouseEnter={(e) => handleChineseWordHover(e)}
                    onMouseLeave={(e) => handleWordLeave(e)}
                  >
                    {word}
                  </span>
                );
              } else {
                return <span key={`cn-${index}`}>{word}</span>;
              }
            })}
          </p>
        </div>
        
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

  // 处理中文词语悬停
  const handleChineseWordHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget;
    target.style.backgroundColor = '#e6f4ea';
    
    // 先清除可能存在的旧气泡
    const existingTooltips = target.querySelectorAll('.vocab-tooltip');
    existingTooltips.forEach(tooltip => {
      target.removeChild(tooltip);
    });
    
    const englishWords = target.getAttribute('data-english') || '';
    const explanation = target.getAttribute('data-explanation') || '';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'vocab-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#333';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.width = 'max-content';
    tooltip.style.maxWidth = '300px';
    tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.textAlign = 'left';
    tooltip.style.lineHeight = '1.4';
    
    // 先添加内容
    tooltip.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px; color: #1a73e8; font-size: 13px;">${englishWords}</div>
      ${explanation ? `<div style="font-size: 12px;">${explanation}</div>` : ''}
    `;
    
    // 其余代码与handleWordHover相同
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

  // parseMarkdownTable 函数需要修改以正确提取中文翻译
  const parseMarkdownTable = () => {
    try {
      // 处理文本中的\n字符串，将其转换为实际换行符
      const processedText = markdownText.replace(/\\n/g, '\n');
      
      // 分割文本为行
      const lines = processedText.split('\n');
      
      const result: TableItem[] = [];
  
      // 提取中文翻译
      const chineseTranslationLine = lines.find(line => 
        line.startsWith('**中文翻译**'));
      
      const chineseTranslation = chineseTranslationLine 
        ? lines[lines.indexOf(chineseTranslationLine) + 1] 
        : '';
            
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

  // 处理单词悬停
  const handleWordHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget;
    target.style.backgroundColor = '#d2e3fc'; // 更深的蓝色背景
    
    // 先清除可能存在的旧气泡
    const existingTooltips = target.querySelectorAll('.vocab-tooltip');
    existingTooltips.forEach(tooltip => {
      target.removeChild(tooltip);
    });
    
    const explanation = target.getAttribute('data-explanation') || '';
    const translation = target.getAttribute('data-translation') || '';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'vocab-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#333';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px';
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
    
    // 清除所有气泡，不只是第一个
    const tooltips = target.querySelectorAll('.vocab-tooltip');
    tooltips.forEach(tooltip => {
      target.removeChild(tooltip);
    });
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