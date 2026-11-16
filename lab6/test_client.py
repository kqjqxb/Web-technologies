"""Перевірка MCP-сервера без LLM: запуск через stdio, tools/list і виклик кожного інструмента."""
import asyncio
import json
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

SERVER = Path(__file__).with_name("mcp_server.py")


def text(result) -> str:
    return "\n".join("  " + line for line in result.content[0].text.splitlines())


async def main():
    params = StdioServerParameters(command=sys.executable, args=["-u", str(SERVER)])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            init = await session.initialize()
            print(f"initialize: server = {init.server_info.name}, protocol = {init.protocol_version}")

            tools = await session.list_tools()
            print("\ntools/list:")
            for tool in tools.tools:
                args = ", ".join(tool.input_schema.get("properties", {}))
                print(f"  {tool.name}({args})")

            calls = [
                ("get_tech_cards", {}),
                ("sort_tech_cards", {"sort_by": "duration", "direction": "desc"}),
                ("search_tech_cards", {"query_text": "вал", "field": "detail"}),
                ("search_tech_cards", {"query_text": "токарна", "field": "processing_type"}),
            ]
            for name, arguments in calls:
                result = await session.call_tool(name, arguments)
                print(f"\ntools/call {name} {json.dumps(arguments, ensure_ascii=False)}")
                print(text(result))

            bad = await session.call_tool("sort_tech_cards", {"sort_by": "price"})
            print(f"\ntools/call sort_tech_cards {{\"sort_by\": \"price\"}}\n  isError = {bad.is_error}")


if __name__ == "__main__":
    asyncio.run(main())
