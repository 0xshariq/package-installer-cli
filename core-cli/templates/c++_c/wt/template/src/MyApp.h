#ifndef MY_APP_H
#define MY_APP_H


#include <Wt/WApplication.h>
#include <Wt/WText.h>


class MyApp : public Wt::WApplication {
public:
MyApp(const Wt::WEnvironment &env);
};


#endif