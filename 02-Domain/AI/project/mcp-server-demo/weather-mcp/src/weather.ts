/*
 * @Date         : 2026-06-15 13:55:07 星期1
 * @Author       : xut
 * @Description  :
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import z from "zod"

const server = new McpServer({
  name: "weather-mcp",
  version: "0.0.1",
})

server.registerTool(
  "get_weather",
  {
    description: "Get weather information for a city",
    inputSchema: z.object({
      city: z.string().describe("City name"),
      country: z.string().describe("Country code (e.g., US, UK)"),
    }),
    outputSchema: z.object({
      temperature: z.object({
        celsius: z.number().describe("Temperature in Celsius"),
        fahrenheit: z.number().describe("Temperature in Fahrenheit"),
      }),
      condition: z
        .enum(["Sunny", "Cloudy", "Rainy", "Stormy", "Snowy"])
        .describe("Weather condition"),
      humidity: z.number().min(0).max(100).describe("Humidity percentage"),
      wind: z.object({
        speed_kmh: z.number().describe("Wind speed in km/h"),
        direction: z
          .string()
          .describe("Wind direction (e.g., N, NE, E, SE, S, SW, W, NW)"),
      }),
    }),
  },
  async ({ city, country }) => {
    // 基于 STDIO 的服务器：切勿使用 console.log() ，因为它默认会将数据写入标准输出流。将数据写入标准输出流会破坏 JSON-RPC 消息的结构，从而导致服务器无法正常运行。
    // 可以使用 error 输入显示
    // console.log("input parameter: { city: %s, country: %s }", city, country)
    console.error("input parameter: { city: %s, country: %s }", city, country)
    void city
    void country

    // 以下模拟返回数据结构
    const temp_c = Math.round((Math.random() * 35 - 5) * 10) / 10
    const condition = ["Sunny", "Cloudy", "Rainy", "Stormy", "Snowy"][
      Math.floor(Math.random() * 5)
    ]

    const structuredContent = {
      temperature: {
        celsius: temp_c,
        fahrenheit: Math.round(((temp_c * 9) / 5 + 32) * 10) / 10,
      },
      condition,
      humidity: Math.round(Math.random() * 100),
      wind: {
        speed_kmh: Math.round(Math.random() * 100),
        direction: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
          Math.floor(Math.random() * 8)
        ],
      },
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(structuredContent, null, 2),
        },
      ],
      structuredContent,
    }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("Weather MCP Server running on stdio")
}

main().catch((error) => {
  console.error("Fatal error in main():", error)
  process.exit(1)
})
