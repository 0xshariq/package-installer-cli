cmake_minimum_required(VERSION 3.10)
project(restbed_starter)
set(CMAKE_CXX_STANDARD 17)


find_package(restbed REQUIRED)


add_executable(restbed_starter
src/main.cpp
src/routes.cpp
)


target_include_directories(restbed_starter PRIVATE ${RESTBED_INCLUDE_DIRS})
target_link_libraries(restbed_starter ${RESTBED_LIBRARIES})