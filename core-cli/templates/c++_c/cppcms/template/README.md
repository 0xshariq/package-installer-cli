Build & Run

Install CppCMS and development headers for your OS (example):

Ubuntu/Debian: sudo apt-get install libcppcms-dev cppcms

Fedora: dnf install cppcms-devel cppcms

From project root:

mkdir build && cd build
cmake ..
make -j

Run the binary with config file:

./cppcms_starter --config=../config.json

Open http://localhost:8080/ in a browser.