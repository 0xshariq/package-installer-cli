#ifndef MY_APP_H
#define MY_APP_H


#include <cppcms/application.h>
#include <cppcms/applications_pool.h>
#include <cppcms/service.h>
#include <cppcms/url_dispatcher.h>


class MyApp : public cppcms::application {
public:
MyApp(cppcms::service &srv);
void index();
};


#endif // MY_APP_H