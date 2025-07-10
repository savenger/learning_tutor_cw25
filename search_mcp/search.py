
from mcp.server.fastmcp import FastMCP
import requests
import os
import json

# Initialize FastMCP server
mcp = FastMCP("search", authenticate=None, host="0.0.0.0")

@mcp.tool(
    description="Performs a google search. Use for things that might need up-to-date information"
)
def search(query: str) -> str:

    url = "https://google.serper.dev/search"

    payload = json.dumps({
        "q": query
    })

    headers = {
        'X-API-KEY': os.environ.get('SERPER_KEY'),
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    return response.text


if __name__ == "__main__":
    mcp.run(transport='sse')