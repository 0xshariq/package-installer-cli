class PackageInstallerCli < Formula
  desc "CLI tool to install and manage packages easily"
  homepage "https://github.com/0xshariq/homebrew-tap"
  version "2.2.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/package-installer-cli-2.2.0-darwin-arm64.tar.gz"
      sha256 "1842b18d90294016142d6e73f70bc6a1ce385f698fc09db67e7d0736a516f2f5"
    else
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/package-installer-cli-2.2.0-darwin-amd64.tar.gz"
      sha256 "cd204946d716fd6495074675798ee85fdc9ecb87c32065451f909da2b7befc6b"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/package-installer-cli-2.2.0-linux-arm64.tar.gz"
      sha256 "c1923031c7f744b417f03f7a218a7f2da3e75835d6652b5cba25717e292688c1"
    else
      url "https://github.com/0xshariq/homebrew-tap/releases/download/v2.2.0/package-installer-cli-2.2.0-linux-amd64.tar.gz"
      sha256 "b3f45823343f0e2480e63f8b6e389347e46519b62284fe4a2c11562fd8c26913"
    end
  end

  def install
    bin.install "package-installer-cli"
  end

  test do
    system "#{bin}/package-installer-cli", "--version"
  end
end
