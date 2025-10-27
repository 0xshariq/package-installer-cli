import requests
import os
import sys
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
prompt = " ".join(sys.argv[1:]) or "Explain Artificial Intelligence in one line."

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
payload = {
    "model": "mistralai/mixtral-8x7b",
    "messages": [{"role": "user", "content": prompt}]
}

res = requests.post(url, headers=headers, json=payload).json()
print("🌍 OpenRouter:", res["choices"][0]["message"]["content"])
