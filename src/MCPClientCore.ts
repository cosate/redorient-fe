import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import OpenAI from "openai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/chat/completions.js";
import config from "./config";

// 重新定义环境变量类型以适应浏览器环境
interface EnvConfig {
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
}

interface MCPToolResult {
  content: string;
}

interface CommonDto {
  flag: boolean;
  result: string;
}

interface ServerConfig {
  name: string;
  type: 'command' | 'sse' | 'streamable';
  command?: string;
  url?: string;
  isOpen?: boolean;
}

export class MCPClientCore {
  static getOpenServers(): string[] {
    return config.filter((cfg: any) => cfg.isOpen).map((cfg: any) => cfg.name);
  }

  private sessions: Map<string, Client> = new Map();
  private transports: Map<string, SSEClientTransport | StreamableHTTPClientTransport> = new Map();
  private openai: OpenAI;
  private env: EnvConfig;

  constructor(env: EnvConfig) {
    this.env = env;
    // 在浏览器环境中，我们支持 SSE 和 Streamable HTTP 传输方式
    this.openai = new OpenAI({
      baseURL: env.OPENAI_BASE_URL,
      apiKey: env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // 允许在浏览器中使用
    });
  }

  async connectToServer(serverName: string): Promise<void> {
    const serverConfig = config.find((cfg: any) => cfg.name === serverName) as ServerConfig;
    if (!serverConfig) {
      throw new Error(`Server configuration not found for: ${serverName}`);
    }

    let transport: SSEClientTransport | StreamableHTTPClientTransport;

    // 在前端环境中，我们支持 SSE 和 Streamable HTTP 传输方式
    if (serverConfig.type === 'sse' && serverConfig.url) {
      transport = await this.createSSETransport(serverConfig.url);
    } else if (serverConfig.type === 'streamable' && serverConfig.url) {
      transport = await this.createStreamableHTTPTransport(serverConfig.url);
    } else {
      throw new Error(`Unsupported transport type for server: ${serverName}. Only SSE and Streamable HTTP are supported in browser.`);
    }

    const client = new Client(
      {
        name: "mcp-client",
        version: "1.0.0"
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {}
        }
      }
    );

    await client.connect(transport);

    this.sessions.set(serverName, client);
    this.transports.set(serverName, transport);

    // 列出可用工具
    const response = await client.listTools();
    console.log(`Connected to server '${serverName}' with tools:`, response.tools.map((tool: Tool) => tool.name));
  }

  private async createSSETransport(url: string): Promise<SSEClientTransport> {
    return new SSEClientTransport(new URL(url));
  }

  private async createStreamableHTTPTransport(url: string): Promise<StreamableHTTPClientTransport> {
    // 在浏览器环境中，如果 URL 是相对路径，则拼接当前域名
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    console.log(`Creating Streamable HTTP transport for: ${fullUrl}`);
    return new StreamableHTTPClientTransport(new URL(fullUrl));
  }

  async processQuery(query: string): Promise<string> {
    if (this.sessions.size === 0) {
      throw new Error("Not connected to any server");
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: query
      }
    ];

    // 获取所有服务器的工具列表
    const availableTools: any[] = [];
    for (const [serverName, session] of this.sessions) {
      const response = await session.listTools();
      const tools = response.tools.map((tool: Tool) => ({
        type: "function" as const,
        function: {
          name: `${serverName}__${tool.name}`,
          description: `[${serverName}] ${tool.description}`,
          parameters: tool.inputSchema
        }
      }));
      availableTools.push(...tools);
    }

    // 调用OpenAI API
    const completion = await this.openai.chat.completions.create({
      model: this.env.OPENAI_MODEL,
      messages,
      tools: availableTools,
      tool_choice: "auto"
    });

    const finalText: string[] = [];
    console.log(JSON.stringify(completion, null, 2));

    // 处理OpenAI的响应
    for (const choice of completion.choices) {
      const message = choice.message;
      if (message.content) {
        finalText.push(message.content);
      }
      if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
          let data:CommonDto = await this.useTool(toolCall);
          console.log(JSON.stringify(data, null, 2));
          if(data.flag){
            finalText.push(data.result);
            // 继续与工具结果的对话
            const newMessage: ChatCompletionMessageParam[] = [
              {
                role: "user",
                content: query
              }
            ];
            newMessage.push({
              role: "user",
              content: `请使用工具${toolCall.function.name}的结果${JSON.stringify(data.result)},组装成下一次的请求,如果不需要工具,请直接回复`
            });
            console.log("下次请求message:",JSON.stringify(newMessage, null, 2));
            // 获取下一个响应
            const nextCompletion = await this.openai.chat.completions.create({
              model: this.env.OPENAI_MODEL,
              messages: newMessage,
            });
            const nextMessage = nextCompletion.choices[0].message;
            console.log("下次请求:",JSON.stringify(nextMessage, null, 2));
            if (nextMessage.content) {
              let nextTask = await this.processQuery(nextMessage.content);
              finalText.push(nextTask);
            }
          }else{
            finalText.push(data.result);
          }
        }
      }
    }
    return finalText.join("\n");
  }

  async useTool(toolCall:ChatCompletionMessageToolCall): Promise<CommonDto> {
    const [serverName, toolName] = toolCall.function.name.split('__');
    const commonDto: CommonDto = {
      flag: false,
      result: `${serverName}使用${toolName}工具获取数据失败`
    };

    const session = this.sessions.get(serverName);
    if (!session) {
      commonDto.result =`Error: Server ${serverName} not found`;
      return commonDto;
    }

    let toolArgs = null;
    try{
      toolArgs = JSON.parse(toolCall.function.arguments);
    }catch(e){
      commonDto.result = `Error: Invalid arguments for tool ${toolName}`;
      return commonDto;
    }

    // 执行工具调用
    const result = await session.callTool({
      name: toolName,
      arguments: toolArgs
    });

    const toolResult = result as unknown as MCPToolResult;
    if (toolResult.content) {
      commonDto.flag = true;
      commonDto.result = toolResult.content;
      return commonDto;
    }else{
      return commonDto;
    }
  }

  async cleanup(): Promise<void> {
    for (const transport of this.transports.values()) {
      await transport.close();
    }
    this.transports.clear();
    this.sessions.clear();
  }

  hasActiveSessions(): boolean {
    return this.sessions.size > 0;
  }

  getActiveServers(): string[] {
    return Array.from(this.sessions.keys());
  }
}