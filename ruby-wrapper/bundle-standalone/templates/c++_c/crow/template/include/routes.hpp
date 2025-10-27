#pragma once
#include "crow.h"

inline void registerRoutes(crow::SimpleApp& app)
{
    // Root route
    CROW_ROUTE(app, "/")([](){
        return "Hello, Crow Framework!";
    });

    // Example JSON route
    CROW_ROUTE(app, "/api/data")
    ([](){
        crow::json::wvalue data;
        data["project"] = "Crow Web Server";
        data["status"] = "running";
        return data;
    });
}
