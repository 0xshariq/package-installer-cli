from quart import Quart, jsonify

app = Quart(__name__)

@app.route('/')
async def home():
    return jsonify(message="Hello from Quart!")

if __name__ == '__main__':
    app.run(debug=True)
