import React, { useState, useEffect, useRef } from 'react';

interface TextShowProps {
  defaultText?: string;
  defaultSpeed?: number;
}

const TextShow: React.FC<TextShowProps> = ({
  defaultText = '请输入要显示的文本内容',
  defaultSpeed = 2,
}) => {
  const [text, setText] = useState(defaultText);
  const [speed, setSpeed] = useState(defaultSpeed); // 字/秒
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentIndex < text.length) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= text.length) {
            setIsPlaying(false);
            clearInterval(intervalRef.current as NodeJS.Timeout);
          }
          return nextIndex;
        });
      }, 1000 / speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, text, speed]);

  const handlePlay = () => {
    if (currentIndex >= text.length) {
      // 如果已经播放完毕，重新开始
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(e.target.value));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    handleReset();
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: 'white',
    fontFamily: 'Arial, sans-serif'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333'
  };

  const displayAreaStyle: React.CSSProperties = {
    minHeight: '200px',
    padding: '20px',
    margin: '20px 0',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    fontSize: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.05)'
  };

  const currentCharStyle: React.CSSProperties = {
    color: '#1890ff',
    fontWeight: 'bold',
    fontSize: '72px',
    animation: 'fadeIn 0.3s ease-in-out'
  };

  const controlsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '16px'
  };

  const highlightedCharStyle: React.CSSProperties = {
    color: '#1890ff',
    fontWeight: 'bold'
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    marginBottom: '5px',
    display: 'block'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #d9d9d9',
    minHeight: '100px',
    fontFamily: 'inherit',
    fontSize: '16px',
    resize: 'vertical'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
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

  const sliderContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%'
  };

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>文本逐字播放器</div>
      <div style={controlsContainerStyle}>
        <div>
          <label style={labelStyle}>输入文本：</label>
          <textarea
            style={textareaStyle}
            value={text}
            onChange={handleTextChange}
            placeholder="请输入要显示的文本"
          />
        </div>
        
        <div style={sliderContainerStyle}>
          <label style={labelStyle}>阅读速度：{speed} 字/秒</label>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>0.5</span>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={handleSpeedChange}
              style={sliderStyle}
            />
            <span>10</span>
          </div>
        </div>

        <div style={displayAreaStyle}>
          {currentIndex < text.length ? (
            <span style={currentCharStyle}>
              {text[currentIndex] || ''}
            </span>
          ) : (
            <span style={{color: '#999', fontSize: '24px'}}>
              播放完毕
            </span>
          )}
        </div>

        <div style={{...buttonGroupStyle, marginBottom: '10px'}}>
          <div style={{fontSize: '14px', color: '#666'}}>
            进度: {currentIndex}/{text.length} 字
          </div>
        </div>

        <div style={buttonGroupStyle}>
          {!isPlaying ? (
            <button 
              style={primaryButtonStyle} 
              onClick={handlePlay}
            >
              ▶️ 播放
            </button>
          ) : (
            <button 
              style={primaryButtonStyle} 
              onClick={handlePause}
            >
              ⏸️ 暂停
            </button>
          )}
          <button 
            style={secondaryButtonStyle} 
            onClick={handleReset}
          >
            🔄 重置
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextShow;