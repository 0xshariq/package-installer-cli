from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response

def hello_world(request):
    return Response('Hello from Pyramid!')

if __name__ == '__main__':
    with Configurator() as config:
        config.add_route('home', '/')
        config.add_view(hello_world, route_name='home')
        app = config.make_wsgi_app()

    server = make_server('0.0.0.0', 6543, app)
    print("Serving on http://localhost:6543")
    server.serve_forever()
