import React, { useState, useEffect, useRef } from 'react';
import '../css/pasteImage.css';

interface PasteImageProps {
  onImagePaste?: (file: File) => void;
  onUrlPaste?: (url: string) => void;
}

const PasteImage: React.FC<PasteImageProps> = ({ onImagePaste, onUrlPaste }) => {
  const [image, setImage] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // 处理图片粘贴
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target && event.target.result) {
                  setImage(event.target.result as string);
                  if (onImagePaste) {
                    onImagePaste(file);
                  }
                }
              };
              reader.readAsDataURL(file);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };

    // 添加粘贴事件监听器
    document.addEventListener('paste', handlePaste);
    
    return () => {
      // 清理事件监听器
      document.removeEventListener('paste', handlePaste);
    };
  }, [onImagePaste]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url.trim()) {
      setImage(url);
      if (onUrlPaste) {
        onUrlPaste(url);
      }
    }
  };

  return (
    <div className="paste-image-container">
      <div className="image-container" ref={containerRef}>
        {image ? (
          <img src={image} alt="粘贴的图片" />
        ) : (
          <p>请粘贴图片</p>
        )}
      </div>
      <input
        className="input-box"
        type="text"
        value={url}
        onChange={handleUrlChange}
        onKeyDown={handleUrlKeyDown}
        placeholder="请粘贴url"
      />
    </div>
  );
};

export default PasteImage;