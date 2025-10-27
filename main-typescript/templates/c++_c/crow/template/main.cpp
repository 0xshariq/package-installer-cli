#include "crow.h"
#include "include/routes.hpp"

int main()
{
    crow::SimpleApp app;

    // Register routes
    registerRoutes(app);

    app.port(8080).multithreaded().run();
}
