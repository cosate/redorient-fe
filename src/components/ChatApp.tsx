import React, { useState, useEffect } from 'react';
import { useMCPClient } from '../hooks/useMCPClient';
import ChatBox from './ChatBox';
import ServerSelector from './ServerSelector';

const ChatApp: React.FC = () => {
  // 从环境变量获取配置
  const env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o",
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  };

  // 添加调试日志
  useEffect(() => {
    console.log("ChatApp rendered with env:", env);
  }, [env]);

  const {
    messages,
    inputText,
    setInputText,
    isConnected,
    isLoading,
    activeServers,
    error,
    connectToServers,
    sendMessage,
    handleKeyPress
  } = useMCPClient({ env });

  // 添加调试日志
  useEffect(() => {
    console.log("ChatApp state:", { isConnected, isLoading, messages, activeServers, error });
  }, [isConnected, isLoading, messages, activeServers, error]);

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>MCP Client</h1>
        <ServerSelector
          onConnect={connectToServers}
          isConnected={isConnected}
          isLoading={isLoading}
          activeServers={activeServers}
        />
      </header>

      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

      <ChatBox
        messages={messages}
        inputText={inputText}
        onInputChange={setInputText}
        onSend={sendMessage}
        isConnected={isConnected}
        isLoading={isLoading}
        onKeyPress={handleKeyPress}
      />

      {!isConnected && (
        <div className="connection-hint">
          <p>Connect to servers to start chatting with MCP tools</p>
        </div>
      )}
    </div>
  );
};

export default ChatApp;