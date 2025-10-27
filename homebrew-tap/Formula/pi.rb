class Pi < Formula
  desc "Second option of Package Installer CLI"
  homepage "https://github.com/0xshariq/homebrew-tap"
  version "2.2.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/pi-2.2.0-darwin-arm64.tar.gz"
      sha256 "245ab7ee721594121f52829acfbf91096c74c702fb15eea5174cf55f0173cc7e"
    else
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/pi-2.2.0-darwin-amd64.tar.gz"
      sha256 "39ca57ba72ae7bd6098ecbdeb178060b569a964b864acfcd0668675f44ab8bc0"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/pi-2.2.0-linux-arm64.tar.gz"
      sha256 "8fb86f12985c57ba8e326b9fc0399aa8388198ed6347decc5d96672cf5ffe41c"
    else
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/pi-2.2.0-linux-amd64.tar.gz"
      sha256 "2c69e31efd0cb029fdf95352dcdf95c095d5bf10b4514b6095c44fcf7d5e3969"
    end
  end

  def install
    bin.install "pi"
  end

  test do
    system "#{bin}/pi", "--version"
  end
end
