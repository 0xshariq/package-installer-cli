from bottle import route, run, response  # type: ignore[import]

@route('/')
def home():
    response.content_type = 'application/json'
    return {'message': 'Hello from Bottle!'}

if __name__ == '__main__':
    run(host='localhost', port=8080, debug=True)
