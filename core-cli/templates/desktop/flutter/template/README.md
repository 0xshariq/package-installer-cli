Flutter Desktop Starter — Quick notes

1) Create the project (when Flutter is installed):
   flutter create flutter_desktop_starter
   cd flutter_desktop_starter

2) Replace lib/main.dart with the provided file.

3) Enable desktop support (if needed):
   flutter config --enable-linux-desktop   # or windows/macOS as needed

4) Run (on same platform):
   flutter run -d linux        # or -d windows / -d macos

5) Build release:
   flutter build linux         # or build windows / macos
