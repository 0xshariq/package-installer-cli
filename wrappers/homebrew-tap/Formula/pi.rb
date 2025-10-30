class Pi < Formula
  desc "Second option of Package Installer CLI"
  homepage "https://github.com/0xshariq/package-installer-cli"
  version "2.3.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/pi-2.3.0-darwin-arm64.tar.gz"
      sha256 "8982403c5e1ea3f1227f9c30ae88257838e0aae0b723e362e8c9e64e56828919"
    else
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/pi-2.3.0-darwin-amd64.tar.gz"
      sha256 "cc526e845a5937be388280f7eeba7a6cb269b93d516f64abe3854d00ffcd9fd2"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/pi-2.3.0-linux-arm64.tar.gz"
      sha256 "5f3f2eba42dbac75df2575b41706225d4913b172fd67e923d522e9aee9747059"
    else
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/pi-2.3.0-linux-amd64.tar.gz"
      sha256 "0a8f91baa5be9107752d9db65e630f14640f5137c8ea148ad3d16083eed92671"
    end
  end

  def install
    bin.install "pi"
  end

  test do
    system "#{bin}/pi", "--version"
  end
end
