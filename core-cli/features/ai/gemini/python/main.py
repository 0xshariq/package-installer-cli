import requests
import os
import sys
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
prompt = " ".join(sys.argv[1:]) or "Explain Artificial Intelligence in one line."

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"
payload = {"contents": [{"parts": [{"text": prompt}]}]}

res = requests.post(url, json=payload)
data = res.json()

print("🌟 Gemini:", data["candidates"][0]["content"]["parts"][0]["text"])
