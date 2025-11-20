cmake_minimum_required(VERSION 3.10)
project(wt_starter)
set(CMAKE_CXX_STANDARD 17)


find_package(Wt REQUIRED COMPONENTS Wt HTTP)


add_executable(wt_starter src/main.cpp src/MyApp.h)
target_link_libraries(wt_starter Wt::Wt Wt::HTTP)