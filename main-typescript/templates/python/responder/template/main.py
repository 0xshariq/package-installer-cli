import responder

api = responder.API()

@api.route("/")
def home(req, resp):
    resp.text = "Hello from Responder!"

@api.route("/api/info")
def info(req, resp):
    resp.media = {"framework": "Responder", "message": "Fast and elegant"}

@api.route("/api/echo")
async def echo(req, resp):
    data = await req.media()
    resp.media = {"you_sent": data}

if __name__ == "__main__":
    api.run(address="0.0.0.0", port=8000)
