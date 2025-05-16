import React, { useState, useRef } from 'react';

interface JsonViewerProps {
  defaultJson?: string;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ defaultJson = '' }) => {
  const [jsonInput, setJsonInput] = useState(defaultJson);
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 解析JSON字符串
  const parseJson = (input: string) => {
    if (!input.trim()) {
      setParsedJson(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setParsedJson(parsed);
      setError(null);
    } catch (err) {
      setParsedJson(null);
      setError(`JSON解析错误: ${(err as Error).message}`);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    parseJson(value);
  };

  // 处理粘贴事件
  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      setJsonInput(text);
      parseJson(text);
      if (textareaRef.current) {
        textareaRef.current.value = text;
      }
    }).catch(err => {
      setError(`无法访问剪贴板: ${err.message}`);
    });
  };

  // 复制格式化的JSON
  const handleCopy = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2);
      navigator.clipboard.writeText(formatted).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        setError(`复制失败: ${err.message}`);
      });
    }
  };

  // 清空输入
  const handleClear = () => {
    setJsonInput('');
    setParsedJson(null);
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  };

  // 格式化JSON
  const handleFormat = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formatted);
      if (textareaRef.current) {
        textareaRef.current.value = formatted;
      }
    }
  };

  // 渲染JSON对象为树形结构
  const renderJsonTree = (data: any, level = 0): JSX.Element => {
    const indent = level * 20; // 每级缩进20px
    
    if (data === null) return <span style={{ color: '#999' }}>null</span>;
    
    if (typeof data === 'boolean') {
      return <span style={{ color: '#0d6efd' }}>{data ? 'true' : 'false'}</span>;
    }
    
    if (typeof data === 'number') {
      return <span style={{ color: '#fd7e14' }}>{data}</span>;
    }
    
    if (typeof data === 'string') {
      return <span style={{ color: '#198754' }}>"{data}"</span>;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) return <span>[]</span>;
      
      return (
        <div>
          <span>[</span>
          <div style={{ marginLeft: `${indent}px` }}>
            {data.map((item, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {renderJsonTree(item, level + 1)}
                {index < data.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>
          <span>]</span>
        </div>
      );
    }
    
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0) return <span>{'{}'}</span>;
      
      return (
        <div>
          <span>{'{'}</span>
          <div style={{ marginLeft: `${indent}px` }}>
            {keys.map((key, index) => (
              <div key={key} style={{ marginBottom: '4px' }}>
                <span style={{ color: '#d63384' }}>"{key}"</span>: {renderJsonTree(data[key], level + 1)}
                {index < keys.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>
          <span>{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(data)}</span>;
  };

  // 样式定义
  const containerStyle: React.CSSProperties = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333'
  };

  const inputContainerStyle: React.CSSProperties = {
    marginBottom: '20px'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #d9d9d9',
    minHeight: '120px',
    fontFamily: 'monospace',
    fontSize: '14px',
    resize: 'vertical'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#1890ff',
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f0f0f0',
    color: '#333'
  };

  const outputContainerStyle: React.CSSProperties = {
    flex: 1,
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    border: '1px solid #d9d9d9'
  };

  const errorStyle: React.CSSProperties = {
    color: '#ff4d4f',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#fff2f0',
    borderRadius: '4px',
    border: '1px solid #ffccc7'
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>JSON结构化查看器</div>
      
      <div style={inputContainerStyle}>
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          value={jsonInput}
          onChange={handleInputChange}
          placeholder="请粘贴JSON字符串..."
        />
      </div>
      
      <div style={buttonGroupStyle}>
        <button style={primaryButtonStyle} onClick={handlePaste}>
          从剪贴板粘贴
        </button>
        <button style={primaryButtonStyle} onClick={handleFormat} disabled={!parsedJson}>
          格式化
        </button>
        <button style={primaryButtonStyle} onClick={handleCopy} disabled={!parsedJson}>
          {copied ? '已复制!' : '复制格式化JSON'}
        </button>
        <button style={secondaryButtonStyle} onClick={handleClear}>
          清空
        </button>
      </div>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <div style={outputContainerStyle}>
        {parsedJson && renderJsonTree(parsedJson)}
        {!parsedJson && !error && <div style={{ color: '#999' }}>解析后的JSON将显示在这里</div>}
      </div>
    </div>
  );
};

export default JsonViewer;