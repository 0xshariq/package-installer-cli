from sanic import Sanic
from sanic.response import json, text

app = Sanic("MySanicApp")

@app.route("/")
async def home(request):
    return text("Hello from Sanic!")

@app.route("/api/data")
async def get_data(request):
    return json({"message": "This is Sanic API", "status": "success"})

@app.post("/api/echo")
async def echo_data(request):
    data = request.json
    return json({"you_sent": data})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
