import React, { useEffect, useRef, useState } from "react";
import type { PlasmoCSConfig } from "plasmo";
import ShowSentence from "./showSentences";

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
  };

const Vocab = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState("");
    const [showSentence, setShowSentence] = useState(false);
    const [markdownText, setMarkdownText] = useState("");

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
        console.log("markdownText: ", markdownText);
        if (inputValue.trim()) {
        // 尝试解析 Markdown 表格
            // setMarkdownText("|原文分词|译文完全对应词|具体解释|\n|---|---|---|\n|Each|每个|表示“每一个”，修饰“component element”，指代所有构成要素中的任意一个|\n|component|-|修饰“element”，表示构成整体的部分，与“要素”共同表达“构成要素”|\n|element|要素|指整体中的某个部分，这里是项目成功的关键组成部分|\n|plays|起到了|表示承担或扮演某种角色，强调其作用，在这里意为“起到……作用”|\n|a|-|不定冠词，用于修饰“critical role”，表示“一个关键作用”|\n|critical|关键|修饰“role”，表明这个作用是至关重要的|\n|role|作用|指某事物在特定情境下所发挥的功能，这里是“关键作用”|\n|in|在|介词，表示范围或领域，说明作用发生的范围|\n|the|-|定冠词，特指“success”即项目的成功|\n|success|成功|指项目达成预期目标的结果|\n|of|-|连接“success”和“project”，表示所属关系，即项目的成功|\n|the|-|定冠词，特指“project”|\n|project|项目|指具体的工作或计划，这里是讨论的对象|");
            setMarkdownText(inputValue)
            setShowSentence(true);
            setInputValue("");
        }
    };

    // 处理流式请求
    const outputRef = useRef<HTMLDivElement>(null);

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
            <ShowSentence markdownText={markdownText} />
          ) : (
            <div ref={outputRef}></div>
          )}
        </div>
      </div>
    );
}

export default Vocab;