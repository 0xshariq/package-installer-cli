#include "routes.h"
#include <string>


std::shared_ptr<Resource> create_root_resource() {
auto resource = std::make_shared<Resource>();
resource->set_path("/");


resource->set_method_handler("GET", [](const std::shared_ptr<Session> session) {
std::string body = "Restbed Starter Running";
session->close(OK, body, { {"Content-Length", std::to_string(body.size())} });
});


return resource;
}


std::shared_ptr<Resource> create_hello_resource() {
auto resource = std::make_shared<Resource>();
resource->set_path("/hello/{name: .*}");


resource->set_method_handler("GET", [](const std::shared_ptr<Session> session) {
auto request = session->get_request();
std::string name = request->get_path_parameter("name", "guest");


std::string body = "Hello, " + name + "!";
session->close(OK, body, { {"Content-Length", std::to_string(body.size())} });
});


return resource;
}