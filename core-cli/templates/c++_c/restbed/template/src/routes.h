#ifndef ROUTES_H
#define ROUTES_H


#include <memory>
#include <restbed>
using namespace restbed;


std::shared_ptr<Resource> create_root_resource();
std::shared_ptr<Resource> create_hello_resource();


#endif