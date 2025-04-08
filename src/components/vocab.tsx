import React, { useEffect, useRef, useState } from "react";
import type { PlasmoCSConfig } from "plasmo";
import ShowSentence from "./showSentences";
import { APIService } from "~services/requests";

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
  };

const Vocab = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState("");
    const [showSentence, setShowSentence] = useState(false);
    const [markdownText, setMarkdownText] = useState("");
    const [streamedContent, setStreamedContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }

    // 处理按键事件
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
        // 尝试解析 Markdown 表格
            setMarkdownText(inputValue);
            setInputValue("");
        }
    };
    const buttonClick = () => {
        if (inputValue.trim()) {
            setMarkdownText(inputValue);
            setInputValue("");
            setIsStreaming(true);
            setStreamedContent("");
            setShowSentence(false);
        }
    };

    // 处理流式请求
    const outputRef = useRef<HTMLDivElement>(null);

    const handleStreamRequest = async (content: string) => {
        if (!outputRef.current) return;
        
        outputRef.current.innerHTML = ""; // 清空之前的输出
        setStreamedContent("");
        setIsStreaming(true);
        
        await APIService.genExampleSentence(content, {
          onChunk: (chunk) => {
            if (outputRef.current) {
              outputRef.current.innerHTML += chunk;
              outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
            
            // 累积流式内容
            setStreamedContent(prev => prev + chunk);
          },
          onError: (error) => {
            console.error("请求出错:", error);
            if (outputRef.current) {
              outputRef.current.innerHTML += `<div style="color: red;">请求出错: ${error.message}</div>`;
            }
            setIsStreaming(false);
          }
        });
        
        // 流式请求完成后
        setIsStreaming(false);
        setShowSentence(true);
    };

    useEffect(() => {
        if (markdownText) {
            handleStreamRequest(markdownText);
        }
    }, [markdownText]);

    return (
        <div style={{height: "100%", display: "flex", flexDirection: "column" }}>
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
            onClick={buttonClick}
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
          {showSentence ? (
            <ShowSentence markdownText={streamedContent} />
          ) : (
            <div ref={outputRef}></div>
          )}
        </div>
      </div>
    );
}

export default Vocab;