---
tags:
  - AI
---
MCP: Model Context Protocol 模型上下文协议

2026年5月30日11:18:54
[MCP: Model Context Protocol官网文档](https://mcp-docs.cn/docs/learn/architecture)
**架构**
Host 宿主：协调管理一个或多个MCP客户端的AI应用，比如 claude code ，vscode
Client 客户端：维持与其对应的MCP服务端的连接，获取服务端响应的数据提供给宿主使用
Server 服务端：执行客户端请求操作，并响应数据。根据位置不同，又可以分为
	- 本地mcp服务端，即与mcp客户端在同个机器上，可以通过 stdio 传输数据
	- 远程mcp服务端，即与mcp客户端不在同个机器上，通过stream http 传输数据

**数据传输协议**




2026年5月30日10:45:21
《MCP极简入门》
传统网站需要关注SEO搜索引擎优化，现代AI时代，需要向LMO语言模型优化转变。让数据对大型语言模型更友好。