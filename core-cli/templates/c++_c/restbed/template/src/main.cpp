#include <restbed>
#include <memory>
#include <iostream>
#include "routes.h"


using namespace restbed;


int main() {
auto settings = std::make_shared<Settings>();
settings->set_port(8080);
settings->set_default_header("Connection", "close");


auto service = std::make_shared<Service>();
service->publish(create_root_resource());
service->publish(create_hello_resource());


std::cout << "Server listening on http://localhost:8080" << std::endl;
service->start(settings);
return 0;
}