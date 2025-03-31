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

    return (
      <div style={{
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        marginBottom: "15px",
        fontSize: "16px",
        lineHeight: "1.6"
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
                  {translationElement && (
                    <>(
                      {translationElement}
                    )</>
                  )}
                </span>
              </React.Fragment>
            );
          })}
        </p>
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
    tooltip.style.bottom = '100%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.backgroundColor = '#333';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.width = 'max-content';
    tooltip.style.maxWidth = '300px';
    tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    tooltip.style.marginBottom = '5px';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.textAlign = 'left';
    tooltip.style.lineHeight = '1.4';
    
    tooltip.innerHTML = `
      <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); 
           width: 0; height: 0; border-left: 5px solid transparent; 
           border-right: 5px solid transparent; border-top: 5px solid #333;"></div>
      ${translation ? `<div style="font-weight: bold; margin-bottom: 4px; color: #0f9d58; font-size: 13px;">${translation}</div>` : ''}
      <div style="font-size: 12px;">${explanation}</div>
    `;
    
    target.appendChild(tooltip);
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