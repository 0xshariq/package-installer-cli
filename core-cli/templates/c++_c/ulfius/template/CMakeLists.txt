cmake_minimum_required(VERSION 3.10)
project(ulfius_starter C)


set(CMAKE_C_STANDARD 11)
find_package(Ulfius REQUIRED)


add_executable(ulfius_starter src/main.c)
target_link_libraries(ulfius_starter ulfius orcania yder)