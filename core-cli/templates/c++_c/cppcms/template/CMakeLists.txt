cmake_minimum_required(VERSION 3.10)
project(cppcms_starter)
set(CMAKE_CXX_STANDARD 17)
find_package( cppcms REQUIRED )
add_executable(cppcms_starter src/main.cpp src/my_app.cpp)
# link cppcms and supporting libs
target_link_libraries(cppcms_starter cppcms)
# If using threading or other libs, add here