import React, { useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBoxProps {
  messages: Message[];
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  isConnected: boolean;
  isLoading: boolean;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  inputText,
  onInputChange,
  onSend,
  isConnected,
  isLoading,
  onKeyPress
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender}`}
          >
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={isConnected ? "Type your message here..." : "Connect to servers first..."}
          rows={2}
          disabled={!isConnected || isLoading}
        />
        <button
          className="send-button"
          onClick={onSend}
          disabled={!isConnected || isLoading || inputText.trim() === ''}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;