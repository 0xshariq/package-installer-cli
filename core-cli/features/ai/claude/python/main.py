import requests
import os
import sys
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY")
prompt = " ".join(sys.argv[1:]) or "Explain Artificial Intelligence in one line."

url = "https://api.anthropic.com/v1/messages"
headers = {
    "x-api-key": API_KEY,
    "content-type": "application/json",
    "anthropic-version": "2023-06-01"
}

data = {
    "model": "claude-3-opus-20240229",
    "max_tokens": 200,
    "messages": [{"role": "user", "content": prompt}]
}

res = requests.post(url, headers=headers, json=data).json()
print("🤖 Claude:", res["content"][0]["text"])
