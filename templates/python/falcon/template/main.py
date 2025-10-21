import falcon
from wsgiref import simple_server

class HelloResource:
    def on_get(self, req, resp):
        resp.media = {'message': 'Hello from Falcon!'}

app = falcon.App()
app.add_route('/', HelloResource())

if __name__ == '__main__':
    with simple_server.make_server('127.0.0.1', 8000, app) as httpd:
        print("Serving on http://127.0.0.1:8000")
        httpd.serve_forever()
