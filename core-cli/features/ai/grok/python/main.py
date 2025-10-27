import requests
import os
import sys
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("XAI_API_KEY")
prompt = " ".join(sys.argv[1:]) or "Explain Artificial Intelligence in one line."

url = "https://api.x.ai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
payload = {
    "model": "grok-beta",
    "messages": [{"role": "user", "content": prompt}]
}

res = requests.post(url, headers=headers, json=payload).json()
print("🚀 Grok:", res["choices"][0]["message"]["content"])
