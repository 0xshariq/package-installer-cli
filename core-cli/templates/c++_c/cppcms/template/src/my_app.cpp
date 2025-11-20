#include "my_app.h"
#include <cppcms/http_response.h>


MyApp::MyApp(cppcms::service &srv)
: cppcms::application(srv)
{
// register route for the root URL
dispatcher().assign("^/$", &MyApp::index, this);
}


void MyApp::index() {
response().out() << "Content-Type: text/html; charset=utf-8\n\n";
response().out() << "<html><head><title>CppCMS Starter</title></head>"
<< "<body><h1>Hello from CppCMS!</h1>"
<< "<p>This is a minimal CppCMS application.</p>"
<< "</body></html>";
}