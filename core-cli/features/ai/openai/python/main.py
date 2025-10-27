from openai import OpenAI
from dotenv import load_dotenv
import os
import sys

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
prompt = " ".join(sys.argv[1:]) or "Explain Artificial Intelligence in one line."

client = OpenAI(api_key=API_KEY)
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}]
)

print("🧠 OpenAI:", response.choices[0].message.content)
