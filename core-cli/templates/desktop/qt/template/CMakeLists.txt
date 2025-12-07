cmake_minimum_required(VERSION 3.5)

project(MyQtApp VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 COMPONENTS Widgets REQUIRED)
# If you use Qt5, replace above with:
# find_package(Qt5 COMPONENTS Widgets REQUIRED)

qt_wrap_ui(UI_HEADERS MainWindow.ui)

add_executable(MyQtApp
    main.cpp
    MainWindow.cpp
    MainWindow.h
    MainWindow.ui
)

target_link_libraries(MyQtApp
    Qt6::Widgets
    # or Qt5::Widgets
)
