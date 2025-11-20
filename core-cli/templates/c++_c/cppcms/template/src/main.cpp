#include <iostream>
#include <cppcms/application.h>
#include <cppcms/applications_pool.h>
#include <cppcms/service.h>
#include "my_app.h"


int main(int argc, char **argv) {
try {
cppcms::service srv(argc, argv);
srv.applications_pool().mount(cppcms::applications_factory<MyApp>());
srv.run();
} catch (std::exception const &e) {
std::cerr << "Error: " << e.what() << std::endl;
return 1;
}
return 0;
}