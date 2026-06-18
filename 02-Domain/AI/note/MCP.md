---
tags:
  - AI
  - MCP
title: MCP
create_date: 2026-05-30 10:42:39
language: LLM
---

## MCP
>[!tip] 简短描述

MCP: Model Context Protocol 模型上下文协议

模型上下文协议（MCP）是一种开放型协议，约定了大型语言模型与外部应用、外部数据源或工具之间标准的通信方式。

## What 它是什么
>[!tip] 它能做什么

狭义上，mcp 主要指规范，约定了大语言模型如何与外部应用工具通信的方式。

广义上，mcp 包括：
- MCP Specification（mpc 规范），关于 mcp 的详细规范，明确了主机、客户端、服务端在实现该技术时的各项要求。
- MCP SDK，用于各种编程语言的 SDK，实现了 mcp 规范。
- MCP 开发工具，用于开发 mcp 客户端和服务端的工具，目前包括 mcp inspector。
- mcp 服务器的参考实现方式，通常 mcp 客户端由 mcp 主机（agent 应用）实现，大部分开发者主要是接入 mcp 服务器，官方提供一些示例代码。

mcp 协议约定了：
- Host 主机，主机协调管理多个客户端（客户端和服务端一一对应）、授权和安全策略等。
- Client 客户端，采样能力 Sampling、根目标 Roots、主动询问能力 Elicitation
- Server 服务端，提供工具 Tools、资源 Resources、提示词模板 Prompts
- JSON-RPC，服务端和客户端消息数据的协议
## Why 为什么是它
>[!tip] 为什么选择它，它有什么优势，同类软件技术有哪些

- 作为标准规范，统一了 agent 外接能力接入方式，避免了各家厂商不一致的使用。
## How 基本使用
>[!tip] quick start 步骤，常用的命令方法等

## Deep 深入更解
>[!tip] 深入项目架构、源码等

### Architecture 架构
mcp 架构中按参与角色包括：
- Host 主机，主机协调管理多个客户端（客户端和服务端一一对应）、授权和安全策略等。
- Client 客户端，采样能力 Sampling、根目标 Roots、主动询问能力 Elicitation
- Server 服务端，提供工具 Tools、资源 Resources、提示词模板 Prompts
![mcp_architecture_role](/04-Asset/41-image/mcp_architecture_role.png)

按数据传输的角度，主要由数据层和传输层组成
- 数据层：采用了基于 JSON-RPC 2.0 的交换协议，该协议明确了消息的结构和含义。
- 传输层：管理客户端与服务器之间的通信渠道及身份验证过程。包括建立连接、对消息进行格式化处理以及进行身份验证等操作。支持两种传输
	- Stdio transport: 标准输入输出的传输方式，主要实现在同一台机器上部署服务端和客户端，两者在不同进程之间的直接通信。这种方式无需网络开销，因此能够提供最佳的性能表现。
	- Streamable HTTP 传输方式：该方式利用 HTTP POST 来传递客户端与服务器之间的消息，同时支持 Server-Sent Events 功能以实现数据流式传输。这种传输方式能够实现远程服务器间的通信，并支持各种标准的 HTTP 认证方式，包括 bearer tokens、API 密钥以及自定义头部信息。MCP 建议使用 OAuth 来获取认证令牌。

![mcp_architecture_data_flow](/04-Asset/41-image/mcp_architecture_data_flow.png)

### JSONRPC

> [JSON-RPC](https://www.jsonrpc.org/specification)

JSON-RPC 是一种基于 JSON 的轻量级 RPC 协议。它定义了统一的数据格式（固定字段）和处理规则，用于在不同系统之间进行远程方法调用。每一条消息体是一个规范的 JSON 字符串。

当前，JSON-RPC 的最新版本是 2.0。MCP 采用 JSON-RPC 2.0 作为客户端与服务器之间的通信基础。

通知和请求示例
```json5
// JSON-RPC 2.0的请求,有两种：通知和请求
// 通知：请求方发起通知请求，不带id参数，不关心响应内容，只用于单方面传递消息，而无须等待和理解被请求方的响应内容。
{ 
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
// 请求方发起待响应请求，需要带上id参数。被请求方必须返回跟请求id匹配的响应内容。
{ 
  "jsonrpc": "2.0",  // 指定JSON-RPC协议的版本，必须为2.0；
  "method": "initialize", // 表示要调用的方法名；
  "params": {  // 参数，可选
    "protocolVersion": "2024-11-05", 
    "capabilities": {}, 
    "clientInfo": { 
      "name": "mcp-client", 
      "version": "1.0.0" 
    } 
  }, 
  "id": 0 // 可选，用于将请求和对应响应关联起来，类似 request_trace_id
}
```
响应示例
```json5
{ 
  "jsonrpc": "2.0", 
  "id": 0,  // 与请求中 id 对应
  // result 响应成功时必须此字段，包括请求方法调用的响应结果
  "result": {
    "protocolVersion": "2024-11-05", 
    "capabilities": { 
      "tools": {} 
    }, 
    "serverInfo": { 
      "name": "mcp-server", 
      "version": "0.0.3" 
    } 
  },
  // error 与 result 互斥，只有一种有值
  "error": {
    "code": -32602,
    "message": "Invalid params"
  }
}
```

### Lifecycle 生命周期

- 初始化阶段：client 和 server 进行协议版本和能力协商；
- 操作阶段：client 和 server 按照协议正常通信，交换消息；
- 关闭阶段：client 和 server 各自优雅终止连接；

#### 初始化阶段：版本协商和能力协商
1. 客户端通过 `client.connect(transport)` 调用，发起连接，带上自身能力；
2. 然后服务端接收请求后，校验客户端协议版本，如果支持，必须使用相同协议版本响应 ，如果不支持，则响应最新版本，并且响应服务端支持的能力和自身基本信息。
3. 客户端接收响应后，校验规范 JSON-RPC 版本，以及 mcp 协议 版本。如果不支持，断开连接，如果支持，必须再发送一个已初始化的通知。
上述建立连接的三个阶段，跟 TCP 建立连接时三次握手的过程类型。

```
+--------+      initialize                                  +--------+
|        +-------------------------------------------------->        |
|        |   clientInfo / protocolVersion / capabilities    |        |
|        |                                                  |        |
|        |                                                  |        |
|        |                                                  |        |
|        |                                                  |        |
| Client |                                 response         | Server |
|        <--------------------------------------------------+        |
|        |   serverInfo / protocolVersion / capabilities    |        |
|        |                                                  |        |
|        |                                                  |        |
|        |                                                  |        |
|        |           notifications/initialized              |        |
|        +-------------------------------------------------->        |
|        |                                                  |        |
+--------+                                                  +--------+
```

客户端 `initialize` 请求报文，带上客户端协议版本和声明客户端具有的能力，以及客户端基本信息。
```json5
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-11-25",
    "capabilities": {
      "roots": {
        "listChanged": true
      },
      "sampling": {},
      "elicitation": {
        "form": {},
        "url": {}
      },
      "tasks": {
        "requests": {
          "elicitation": {
            "create": {}
          },
          "sampling": {
            "createMessage": {}
          }
        }
      }
    },
    "clientInfo": {
      "name": "ExampleClient",
      "title": "Example Client Display Name",
      "version": "1.0.0",
      "description": "An example MCP client application",
      "icons": [
        {
          "src": "https://example.com/icon.png",
          "mimeType": "image/png",
          "sizes": ["48x48"]
        }
      ],
      "websiteUrl": "https://example.com"
    }
  }
}
```

服务端 response 响应报文，返回服务端基本信息、协议版本和服务端具有的能力。
```json5
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-11-25",
    "capabilities": {
      "logging": {},
      "prompts": {
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "listChanged": true
      },
      "tools": {
        "listChanged": true
      },
      "tasks": {
        "list": {},
        "cancel": {},
        "requests": {
          "tools": {
            "call": {}
          }
        }
      }
    },
    "serverInfo": {
      "name": "ExampleServer",
      "title": "Example Server Display Name",
      "version": "1.0.0",
      "description": "An example MCP server providing tools and resources",
      "icons": [
        {
          "src": "https://example.com/server-icon.svg",
          "mimeType": "image/svg+xml",
          "sizes": ["any"]
        }
      ],
      "websiteUrl": "https://example.com/server"
    },
    "instructions": "Optional instructions for the client"
  }
}
```

客户端确认通知
```json5
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

#### 操作阶段：交互消息
在操作阶段，客户端和服务器会根据事先协商好的协议来交换消息。

客户端根据初始化阶段能力协商的结果，请求能力具体信息（描述 description、参数规范 input_schema、输出规范 output_schema）

依据请求的任务不同，有些是同步返回，有些是异步返回（通过监听消息通知接收响应）。

具体可操作的协议接口：

- 通用操作：客户端或服务端都可具有的

| method                                  | 描述                                               |
| --------------------------------------- | ------------------------------------------------ |
| `ping`                                  | 心跳检测，响应 `{"jsonrpc":"2.0", "id":1, "result":{}}` |
| `notifications/cancelled`               | 任意一方通知取消相关请求，不包括任务，任务有专用取消接口                     |
|                                         |                                                  |
| tasks 客户端                               | 实验性能力，未来可能更改                                     |
| `tasks/list`                            |                                                  |
| `tasks/cancel`                          |                                                  |
| `tasks.requests.sampling.createMessage` | 支持服务端针对任务增强发起 `sampling/createMessage`           |
| `tasks.requests.elicitation.create`     | 支持服务端针对任务增强发起 `elicitation/create`               |
|                                         |                                                  |
| tasks 服务端能力                             | 实验性能力，未来可能更改                                     |
| `tasks/list`                            |                                                  |
| `tasks/cancel`                          |                                                  |
| `tasks.requests.tools.call`             | 支持客户端针对任务增强发起 `tools/call`                       |

- 客户端能力（请求由服务端发起，通知由客户端主动发起）

| method                               | 描述                                       |
| ------------------------------------ | ---------------------------------------- |
| `roots/list`                         | 获取根目录，可以是根目录、请求基本地址等                     |
| `notifications/roots/list_changed`   | 主动通知服务端更新根目录                             |
| `sampling/createMessage`             | 不管请求采样内容，还是大模型返回的采样结果，都需要人工确认同意          |
| `elicitation/create`                 | 有 form 和 url 两种参数模式，form 同步返回，url 异步通知结果 |
| `notifications/elicitation/complete` | 只针对 url 交互的异步通知                          |

- 服务端能力（请求由客户端发起，通知由服务端主动发起）

| method                                 | 描述                           |
| -------------------------------------- | ---------------------------- |
| `tools/list`                           | 返回工具列表，支持分页（使用属性 nextCursor） |
| `tools/call`                           | 返回工具调用结果                     |
| `notifications/tools/list_changed`     | 主动通知工具变更                     |
|                                        |                              |
| `resources/list`                       | 返回资源列表，支持分页（使用属性 nextCursor） |
| `resources/template/list`              | 返回资源模板列表                     |
| `resources/read`                       | 读取特定资源详情                     |
| `notifications/resources/list_changed` | 主动通知资源变量                     |
| `resources/subscribe`                  | 支订阅特定资源                      |
| `resources/unsubscribe`                | 取消订阅                         |
|                                        |                              |
| `prompts/list`                         | 返回提示词模板列表                    |
| `prompts/get`                          | 获取特定提示词                      |
| `notifications/prompts/list_changed`   | 通知提示词变更                      |
|                                        |                              |
| `completion/complete`                  | 申请代码补全                       |
| `notifications/message`                | 返回补全内容                       |
|                                        |                              |
| `logging/setLevel`                     | 设置服务端日志级别                    |
#### 关闭阶段：优雅关机

根据连接方式关闭：
- Streamable HTTP：终止连接意味着关闭相应的 HTTP 连接。
- Stdio：
	- 客户端应发起关闭操作：
		- 关闭子进程（服务端）的输入流
		- 等待服务器退出，如果服务器未在合理时间内退出，发送 SIGTERM 信息要求退出
		- 如果服务器在 `SIGTERM` 之后仍无法在合理时间内退出，则发送 `SIGKILL` 。
	- 服务器可以通过关闭与客户的输出流并退出来主动结束运行。

### Version Negotiation 版本协商

在 `initialize` 请求中，客户端必须说明自己所支持的协议版本。该版本应为客户端所支持的最新版本。

如果服务器支持客户端请求的协议版本，那么它必须使用相同的协议版本来响应。否则，服务器必须使用其支持的另一个协议版本来响应。该协议版本应为准服务器所支持的最新版本。

如果客户端不支持服务器响应中所指定的版本，那么它应该断开连接。

- JSONRPC 的版本 `jsonrpc`
- mcp 版本 `protocolVersion

> 如果使用 SSE / Streamable HTTP 协议，客户端在之后向 MCP 服务器发送的所有请求中，都必须包含 `MCP-Protocol-Version: <protocol-version>` HTTP 头部信息。

### Capability Negotiation 能力协商机制 

在初始化阶段，客户端与服务器分别通过 capabilities 字段声明自身支持的能力。

| 端点     | 能力          | 描述                   |
| ------ | ----------- | -------------------- |
| Client | roots       | 能够提供文件系统的根目录访问权限     |
|        | sampling    | 支持大语言模型采样请求          |
|        | elicitation | 支持服务器进行信息征询/引导       |
|        | tasks       | 对需要额外处理才能完成的客户请求的支持  |
| Server | prompts     | 提供即用的提示词模板           |
|        | resources   | 提供易于阅读的资料/内容         |
|        | tools       | 暴露了可调用的工具/功能         |
|        | tasks       | 对需要额外处理才能完成的服务器请求的支持 |
|        | logging     | 输出结构化的日志消息           |
|        | completions | 支持参数自动补全功能           |
每个大能力下，可以再描述子能力，比如
- `listChanged` ：支持对列表变更的实时通知功能（适用于提示信息、资源及工具相关的内容）
- `subscribe` ：支持订阅单个项目的变更情况（仅限于资源相关内容）

在实际开发代码中，声明能力的示例代码：
```typescript
// 客户端创建时声明能力
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
client = new Client(
            {
                name: 'example-client',
                version: '1.0.0'
            },
            {
                capabilities: {
                	roots: {
                		listChanged: true,
                	},
                	sampling: {},
                }
            }
        );

// 服务端创建时声明能力
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
const server = new McpServer({
  name: "weather-mcp",
  version: "0.0.1",
})
server.registerTool(name, config, cb) // 注册工具
server.registerResource(name, uri, config, cb) // 注册资源
server.registerPrompt(name, config, cb) // 注册提示词模板
```

主机会接收客户端与服务端协商沟通的结果，类似 Agent Skill 一样，提取能力元信息，将相关能力信息，作为与大模型对话的上下文中。

mcp 规范协议也在逐渐演化，后续可能会扩展更多协商的能力。

### Authorization 授权

对于目前两种数据交互方式：
- Stdio: 凭证令牌可以通过环境变量中获取
- streamable HTTP：正常通过基于 HTTP 协议的授权方式进行，比如 OAuth 2，HTTP basic 等。

对于 HTTP 交互的形式，与传统的 B/S 授权形式的流程一致。

### Timeout 超时处理

在实现过程中，应为所有发送的请求设置超时时间，以防止连接挂起和资源耗尽。如果请求在超时时间内没有收到成功或错误的响应，发送方应向该请求发送取消通知，同时停止等待响应。

另外也可以增加重试机制，设定重试次数，超过后仍报错，才停止等待响应。

在收到与请求相关的进度通知时，各实现方式可以选择重置超时计时器。因为这表明相关操作确实正在进行中。不过，无论是否收到进度通知，各实现方式都应始终设置最大超时时间，从而限制出现故障的客户端或服务器所带来的影响。

### Error 错误处理
实现方式应能够妥善处理这些错误情况：
- 协议版本不匹配
- 能力协商未能达成一致
- 请求超时

其中错误的 code 在规范中预定义了一批：
```
错误码            消息                         含义
-32700           Parse error                收到无效的JSON
-32600           Invalid Request            发送的JSON不是有效的请求对象
-32601           Method not found           方法不存在或不可用
-32602           Invalid params             无效的请求参数
-32603           Internal error             JSON-RPC内部错误
-32000到-32099   Server error               实现定义的服务器错误范围
```

错误消息示例：
```json5
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Unsupported protocol version",
    "data": {
      "supported": ["2024-11-05"],
      "requested": "1.0.0"
    }
  }
}
```

### Ping 心跳检测

MCP包含一种可选的“ping”机制，该机制允许任一方的设备验证对方是否仍然处于正常响应状态，从而确保连接始终处于活跃状态。

`Ping` 功能是通过简单的请求/响应机制来实现的。客户端或服务器都可以通过发送 ` ping ` 请求来发起“Ping”操作。

- ping 请求也是一个标准的JSON-RPC请求，但不包含任何参数
```json5
{
  "jsonrpc": "2.0",
  "id": "123",
  "method": "ping"
}
```
- 接收方必须立即回复一个空响应
```json5
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": {}
}
```
如果在合理的超时时间内没有收到回复，发送方可以认为该连接已经失效，断开连接，考虑是否重新发起初始化连接。

### Progress 进步

对于那些需要长时间执行的操作，需要跟踪它的执行进度。MCP 规范约定双方都可以主动推送当前长任务的进度通知，以便对方随时了解当前任务状态。

比如客户端发起一个工具调用的请求，并且知道它可能需要执行较长时间，需要对方返回处理进度时，可以在发起的请求参数中设置一个元数据 `_meta: {"progressToken": "xxx"}` 表明当前请求需要你推送执行进度。

```json5
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "_meta": {
      // 进度标志的元数据
      "progressToken": "abc123"
    },
    // 工具调用的参数
    "country": "ZH"
  }
}
```

对方接收到请求后，需要使用通知推送执行进度 `notifications/progress`，包含最初的进度令牌、总计数值、当前进度数值、和可选的消息。

```json5
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "abc123",
    "progress": 50,
    "total": 100,
    "message": "Reticulating splines..."
  }
}
```

## 能力概念理解

### Roots 根目录

通俗来说，MCP 规范中客户端的 **Roots（根目录）** 能力，就像是给 AI 服务端划定了一个“安全活动范围”或“权限边界”。

在 AI 与外部系统交互时，我们通常不希望 AI 能够无限制地访问整个电脑的文件系统，这会有极大的安全风险。Roots 机制允许客户端告诉服务端：“你只能在这个特定的文件夹（或 URI）范围内进行操作”。服务端在读取文件、保存数据时，规范校验读取或写入文件的路径是不是限制在这个边界内，从而在提供便利的同时保障了系统的安全。

**Roots 本质上是一种“信息传达”机制**。客户端通过 Roots 明确告知服务端“你可以去哪里找数据”，而服务端则依据这个边界来规范自己的行为。需要注意的是，虽然 Roots 划定了边界，但真正的文件访问控制权始终掌握在客户端手中，所有的读写操作最终都要经过客户端的安全策略中介。

### Sampling 采样能力

在 MCP（Model Context Protocol）规范中，**客户端采样（Sampling）** 是一个非常强大且核心的特性。为了让你更容易理解，我们可以把它通俗地比作**“服务器向客户端‘借脑子’”**。

通俗解释：什么是客户端采样（Sampling）？

在常规的交互中，通常是客户端（比如你的聊天软件）主动向服务器请求数据或执行操作。但在 Sampling 机制下，**角色反转了**：

1. **服务器遇到难题**：MCP 服务器在处理任务时，发现自己不擅长某些需要“理解”或“生成”的工作（比如给商品写一段吸引人的描述、提炼文章摘要、或者让游戏里的 NPC 说句自然的话）。
2. **发起“取样”请求**：于是，服务器向客户端发送一个 `sampling/createMessage` 请求，意思是：“兄弟，我手头有个活儿，借你的大模型（LLM）帮我处理一下呗？”
3. **客户端“代工”**：客户端收到请求后，会把这个任务交给内置的 LLM 去生成内容。
4. **人类把关（Human-in-the-loop）**：为了保证安全和准确，客户端在把结果交还给服务器之前，通常会先展示给用户看，用户可以批准、修改或拒绝。
5. **结果返回**：最终生成的文本或数据被返回给服务器，服务器继续完成后续流程。

**典型应用场景**：

- **电商后台**：管理员输入商品标题，服务器请求客户端 LLM 生成商品描述。
- **解谜游戏**：玩家与 NPC 对话，服务器把 NPC 的背景设定发给客户端，让 LLM 生成符合人设的对话。
- **代码审查**：代码助手生成代码后，采样请求另一个 LLM 来审查代码的安全性。

---

💻 TypeScript 交互示例：模拟 Sampling 流程

下面我们用 TypeScript 编写一个简单的控制台交互程序，模拟 MCP 中“服务器发起采样请求 -> 客户端（用户）审核 -> 返回结果”的完整闭环。

```typescript
import * as readline from 'readline';

// 1. 模拟 MCP 服务器端：生成采样请求
function createSamplingRequest(productName: string, keywords: string[]) {
    console.log("\n📡 [MCP Server] 正在向客户端发送 sampling/createMessage 请求...");
    return {
        method: "sampling/createMessage",
        params: {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `请为商品 "${productName}" 写一段吸引人的描述。关键词: ${keywords.join(', ')}`
                    }
                }
            ],
            systemPrompt: "你是一个专业的电商文案助手，语言风格要幽默风趣。",
            maxTokens: 100
        }
    };
}

// 2. 模拟 MCP 客户端：处理采样请求与人机交互
function handleSamplingRequest(request: any) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("💻 [MCP Client] 收到采样请求！");
    console.log("📝 任务:", request.params.messages[0].content.text);
    console.log("⚙️ 系统提示:", request.params.systemPrompt);

    // 模拟 LLM 生成内容
    const llmGeneratedText = `【AI生成】${request.params.messages[0].content.text.split('"')[1]} 是一款不可多得的神器！它完美融合了 ${request.params.messages[0].content.text.split(': ')[1]}，让你爱不释手！`;

    console.log("\n🤖 [LLM 生成结果]:", llmGeneratedText);
    
    rl.question('\n👤 [用户审核] 是否将此结果返回给服务器？(y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            console.log("✅ [MCP Client] 审核通过，将采样结果返回给 Server。");
            // 这里模拟返回给服务器的逻辑
            console.log("📡 [MCP Server] 收到采样结果，已更新商品描述！");
        } else {
            console.log("❌ [MCP Client] 用户拒绝，采样请求终止。");
        }
        rl.close();
    });
}

// 3. 触发整个流程
const samplingReq = createSamplingRequest("智能机械键盘", ["RGB背光", "静音红轴", "电竞"]);
handleSamplingRequest(samplingReq);
```

🛠️ 如何运行这段代码？

```bash
    tsc sampling-demo.ts && node sampling-demo.js
```
程序会模拟服务器的请求，展示 LLM 生成的文案，并等待你在命令行输入 `y` 或 `n` 来决定是否将结果返回，完美还原了 MCP 规范中 **Human-in-the-loop（人在回路）** 的安全设计。

### Elicitation 信息征询/引导

通俗解释：什么是 MCP 中的 Elicitation？

在传统的 AI 工具调用中，通常是“一问一答”的单向模式：AI 调用一个工具，必须一次性把所有参数给齐，如果缺了参数，工具往往就会报错或执行失败。

而 MCP 规范中的 **Elicitation（信息征询/引导）** 能力，打破了这种单向模式，让工具变成了“有状态、有交互的参与者”。通俗来说，它允许工具在执行任务的过程中，如果发现缺少必要信息，可以**主动暂停执行，向用户“反问”并收集信息**，拿到信息后再继续完成任务。

**举个生活中的例子：**  
假设你让 AI 帮你订一张去武汉的机票。AI 调用了订票工具，但发现你只说了目的地，没说座位偏好。

- **没有 Elicitation**：工具直接报错“缺少座位参数”，任务失败。
- **有了 Elicitation**：工具会暂停，通过客户端弹出一个表单问你：“请问您偏好靠窗还是靠过道的座位？” 你选择后，工具拿到这个信息，继续完成订票流程。

---

TypeScript 模拟 Elicitation 交互示例

下面我们用 TypeScript 编写一个简易的命令行交互程序，来模拟 MCP 中 Elicitation 的核心工作流。这个示例展示了服务端如何发起征询、客户端如何展示界面并校验数据，以及服务端如何获取结果继续执行。

```typescript
import * as readline from 'readline';

// 1. 模拟 MCP Server 端的业务逻辑
class TravelBookingServer {
  // 模拟预订流程
  async bookVacation() {
    console.log("\n[Server] 正在处理您的武汉度假套餐预订...");
    
    // 模拟发现缺少必要信息，发起 Elicitation 征询
    const elicitationRequest = {
      message: "请确认您的武汉度假预订详情：",
      schema: {
        seatPreference: { type: "string", options: ["靠窗", "靠过道", "无偏好"] },
        addInsurance: { type: "boolean", description: "是否添加旅行保险 (¥150)" }
      }
    };

    // 暂停执行，等待客户端返回用户响应
    const userResponse = await mcpClientProxy.handleElicitation(elicitationRequest);
    
    // 拿到用户补充的信息，继续完成预订
    console.log(`[Server] 收到用户选择: 座位偏好=[${userResponse.seatPreference}], 保险=[${userResponse.addInsurance}]`);
    console.log("[Server] 预订成功！正在为您出票...\n");
  }
}

// 2. 模拟 MCP Client 端的代理与交互逻辑
class MCPClientProxy {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // 核心：处理 Elicitation 请求
  async handleElicitation(request: any): Promise<any> {
    return new Promise((resolve) => {
      console.log(`\n[Client UI] 📢 ${request.message}`);
      
      // 将 schema 转换为用户可理解的交互界面
      const optionsStr = request.schema.seatPreference.options.join(" / ");
      this.rl.question(`[Client UI] 请选择座位偏好 (${optionsStr}): `, (seat) => {
        this.rl.question(`[Client UI] 是否添加旅行保险? (y/n): `, (ins) => {
          
          // 客户端对用户输入进行结构校验并返回
          const response = {
            seatPreference: seat || "无偏好",
            addInsurance: ins.toLowerCase() === 'y'
          };
          
          console.log("[Client] ✅ 数据校验通过，已将响应返回给 Server");
          resolve(response);
        });
      });
    });
  }
}

// 3. 启动模拟流程
const mcpClientProxy = new MCPClientProxy();
const server = new TravelBookingServer();
server.bookVacation();
```

代码核心逻辑解析：

1. **Server 发起请求**：`TravelBookingServer` 在执行过程中，通过 `mcpClientProxy.handleElicitation` 发出带有 `schema`（数据结构定义）的请求，并主动挂起（`await`）等待。
2. **Client 代理交互**：`MCPClientProxy` 接收到请求后，负责将结构化的数据渲染成终端提示（在实际应用中，这会渲染成网页表单或弹窗）。它负责收集用户输入，并进行校验。
3. **闭环继续执行**：Client 将校验后的合规数据返回给 Server，Server 解除挂起状态，利用新获取的上下文继续完成后续的业务逻辑。

这种设计让 MCP 从单纯的“函数调用”升级成了真正的“对话式调用”，极大地提升了复杂任务处理的灵活性。

### Tasks 长任务

通俗理解 MCP 中的 Tasks 能力

在 MCP（Model Context Protocol）规范中，传统的工具调用（Tools）通常是**同步**的：客户端发起请求，服务端处理完立刻返回结果。这在处理读文件、查数据库等“短平快”的任务时很好用。

但是，当遇到需要几分钟甚至几小时才能完成的**长任务**（如深度研究、复杂数据分析、大型代码重构）时，同步调用就会面临连接超时、客户端不知道服务端是否还在工作等问题。

**Tasks（任务）能力就是为了解决这个问题而生的。** 通俗来说，它引入了**“现在发起，稍后取结果”**（call-now / fetch-later）的执行模式。它把长任务变成了一个“容器”，服务端收到请求后会立刻返回一个任务 ID，客户端可以拿着这个 ID 随时去查询任务的状态（比如：正在处理中、已完成），直到最终拿到结果。这就好比你在餐厅点了一份需要慢炖的菜，服务员会给你一个取餐号，你可以随时看号码牌的状态，而不是站在厨房门口干等。

---

TypeScript 交互示例：模拟 Tasks 流程

由于目前 Tasks 仍处于实验性阶段，且完整的 MCP 客户端/服务端开发较为复杂，下面我用 TypeScript 编写一个**模拟 MCP Tasks 核心交互逻辑**的简单示例。这个示例展示了“发起任务 -> 轮询状态 -> 获取结果”的完整生命周期：

```typescript
// 1. 定义任务状态和结果的类型接口
enum TaskStatus {
  WORKING = 'working',
  COMPLETED = 'completed'
}

interface TaskResult {
  taskId: string;
  status: TaskStatus;
  data?: string;
}

// 2. 模拟一个耗时的 MCP 服务端任务
class MockMCPServer {
  private tasks: Map<string, TaskResult> = new Map();

  // 发起任务（对应 MCP 的 tools/call + task metadata）
  public startLongTask(taskId: string): TaskResult {
    console.log(`[Server] 收到任务 ${taskId}，开始后台处理...`);
    
    // 立即返回“处理中”状态，不阻塞客户端
    const task: TaskResult = { taskId, status: TaskStatus.WORKING };
    this.tasks.set(taskId, task);

    // 模拟耗时 3 秒的长任务
    setTimeout(() => {
      const completedTask = this.tasks.get(taskId);
      if (completedTask) {
        completedTask.status = TaskStatus.COMPLETED;
        completedTask.data = "深度研究任务已完成，这是最终的分析报告！";
        console.log(`[Server] 任务 ${taskId} 处理完成！`);
      }
    }, 3000);

    return task;
  }

  // 查询任务状态（对应 MCP 的 tasks/get）
  public getTask(taskId: string): TaskResult | undefined {
    return this.tasks.get(taskId);
  }
}

// 3. 模拟 MCP 客户端的交互流程
async function runClientInteraction() {
  const server = new MockMCPServer();
  const taskId = "task-001";

  // 步骤一：发起任务
  console.log("\n[Client] 正在发起长任务...");
  let currentTask = server.startLongTask(taskId);
  console.log(`[Client] 收到响应: 任务ID=${currentTask.taskId}, 状态=${currentTask.status}`);

  // 步骤二：轮询状态（模拟客户端定期拉取）
  while (currentTask.status !== TaskStatus.COMPLETED) {
    console.log("[Client] 任务还在进行中，等待 1 秒后再次查询...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentTask = server.getTask(taskId)!;
  }

  // 步骤三：获取最终结果
  console.log(`\n[Client] 任务状态已更新为: ${currentTask.status}`);
  console.log(`[Client] 获取到最终结果: ${currentTask.data}`);
}

// 运行交互示例
runClientInteraction();
```

示例运行效果

运行上述代码，控制台会输出类似以下的交互过程，直观展示了 Tasks 的异步特性：

```text
[Client] 正在发起长任务...
[Server] 收到任务 task-001，开始后台处理...
[Client] 收到响应: 任务ID=task-001, 状态=working
[Client] 任务还在进行中，等待 1 秒后再次查询...
[Client] 任务还在进行中，等待 1 秒后再次查询...
[Server] 任务 task-001 处理完成！
[Client] 任务还在进行中，等待 1 秒后再次查询...

[Client] 任务状态已更新为: completed
[Client] 获取到最终结果: 深度研究任务已完成，这是最终的分析报告！
```

通过这个示例可以看出，Tasks 能力将原本可能阻塞或超时的长操作，拆解成了**状态追踪**和**延迟获取**，让 AI Agent 能够更可靠地管理和执行复杂的长时间工作流。

### Completions 补全建议

通俗地说，MCP 规范中服务端的 **completions（补全）能力**，就像是给 AI 或开发者提供的一个**“智能输入提示框”**。它的主要作用是让客户端（比如你使用的 AI 软件或 IDE）在输入参数时，能够像我们在写代码或填表单时一样，获得上下文相关的自动补全建议。

为了让你更容易理解，我们可以从以下几个方面来拆解这个能力：

**1. 它是做什么的？（核心体验）**  
当你在和 AI 交互，或者调用某个服务需要填写参数时，你不需要每次都把完整的参数名或内容敲完。只要输入一部分（比如前几个字母），服务端就会根据你当前的上下文，返回一个包含可能选项的列表供你选择。这就像手机输入法打字时的联想词，或者程序员写代码时的代码提示，能极大减少输入错误，提升效率。

**2. 它能补全什么内容？**  
在 MCP 协议中，这种补全建议主要针对两种特定的引用类型：

- **提示词（ref/prompt）**：比如你正在输入一段给 AI 的指令，服务端可以补全相关的提示词模板或参数。
- **资源 URI（ref/resource）**：比如你需要指定一个文件路径或数据库表名，服务端可以补全相关的资源链接。

**3. 它是怎么工作的？（交互流程）**  
整个过程非常标准化，分为三步：

- **声明能力**：服务端首先会告诉客户端：“我支持参数自动补全功能哦”（声明 `completions` 能力）。
- **发起请求**：当用户开始输入时，客户端会向服务端发送一个 `completion/complete` 请求，告诉服务端：“用户现在输入了 `py`，请给我补全建议。”
- **返回建议**：服务端收到请求后，会返回一个按相关性排序的候选列表（比如返回 `python`、`pytorch`、`pyside` 等），每次最多返回 100 个选项。

**4. 举个生动的例子**  
假设你正在使用一个支持 MCP 的 AI 助手来查询订单。当你输入“查询用户订单状态，订单号为”时，服务端识别到你需要一个订单号参数，于是主动返回补全建议：“请输入 12 位订单号，支持通过 status（待发货/已发货）和 date（下单日期）进行筛选”。这就是补全能力在实际业务中的体现。

总而言之，MCP 的 completions 能力就是把传统软件开发中优秀的“IDE 交互体验”引入了 AI 与大模型的交互中，让机器更懂用户的输入意图，从而提供更顺畅、更精准的服务。

## MCP Lifecycle

![mcp_lifecycle](mcp_lifecycle.webp)

## Reference 引用参考
>[!tip] 参考链接、资料等

- [MCP: Model Context Protocol](https://modelcontextprotocol.io)
- 《这就是 MCP》

