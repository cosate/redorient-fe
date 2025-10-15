import { useState, useEffect, useRef } from 'react';
import { MCPClientCore } from '../MCPClientCore';
import config from '../config';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface UseMCPClientProps {
  env: {
    OPENAI_API_KEY: string;
    OPENAI_MODEL: string;
    OPENAI_BASE_URL: string;
  };
}

export const useMCPClient = ({ env }: UseMCPClientProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeServers, setActiveServers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<MCPClientCore | null>(null);

  // 初始化客户端
  useEffect(() => {
    clientRef.current = new MCPClientCore(env);

    return () => {
      if (clientRef.current) {
        clientRef.current.cleanup();
      }
    };
  }, [env.OPENAI_API_KEY, env.OPENAI_MODEL, env.OPENAI_BASE_URL]);

  // 连接到服务器
  const connectToServers = async () => {
    if (!clientRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const openServers = config.filter((cfg: any) => cfg.isOpen).map((cfg: any) => cfg.name);
      console.log("Connecting to servers:", openServers.join(", "));

      // 连接所有开启的服务器
      for (const serverName of openServers) {
        try {
          await clientRef.current.connectToServer(serverName);
        } catch (error) {
          console.error(`Failed to connect to server '${serverName}':`, error);
          setError(`Failed to connect to server '${serverName}': ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      if (!clientRef.current.hasActiveSessions()) {
        throw new Error("Failed to connect to any server");
      }

      setIsConnected(true);
      setActiveServers(clientRef.current.getActiveServers());
      addMessage("Connected to MCP servers successfully!", "bot");
    } catch (error) {
      console.error("Connection error:", error);
      setError(error instanceof Error ? error.message : String(error));
      addMessage(`Connection failed: ${error instanceof Error ? error.message : String(error)}`, "bot");
    } finally {
      setIsLoading(false);
    }
  };

  // 添加消息到聊天记录
  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  // 发送消息
  const sendMessage = async () => {
    if (inputText.trim() === '' || !clientRef.current || !isConnected) return;

    // 添加用户消息
    addMessage(inputText, 'user');
    const query = inputText;
    setInputText('');

    setIsLoading(true);
    setError(null);

    try {
      // 处理查询并获取响应
      const response = await clientRef.current.processQuery(query);

      // 添加机器人响应
      addMessage(response, 'bot');
    } catch (error) {
      console.error("Query error:", error);
      setError(error instanceof Error ? error.message : String(error));
      addMessage(`Error: ${error instanceof Error ? error.message : String(error)}`, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
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
  };
};