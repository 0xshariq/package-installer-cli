#include <Wt/WServer.h>
#include "MyApp.h"


MyApp::MyApp(const Wt::WEnvironment &env) : Wt::WApplication(env) {
setTitle("Wt Starter");
root()->addWidget(std::make_unique<Wt::WText>("Wt Starter App Running"));
}


int main(int argc, char **argv) {
try {
Wt::WServer server(argc, argv, "wt_config.xml");


server.addEntryPoint(Wt::EntryPointType::Application,
[](const Wt::WEnvironment &env) {
return std::make_unique<MyApp>(env);
}
);


server.run();
} catch (std::exception &e) {
std::cerr << e.what() << std::endl;
return 1;
}
}