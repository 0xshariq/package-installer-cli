cmake_minimum_required(VERSION 3.10)
project(crow_app)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add Crow and dependencies
include(FetchContent)
FetchContent_Declare(
    crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG v1.0+5
)
FetchContent_MakeAvailable(crow)

# Create executable
add_executable(crow_app main.cpp)
target_link_libraries(crow_app PRIVATE Crow::Crow)
