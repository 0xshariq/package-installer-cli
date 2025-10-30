class PackageInstallerCli < Formula
  desc "CLI tool to install and manage packages easily"
  homepage "https://github.com/0xshariq/package-installer-cli"
  version "2.3.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/package-installer-cli-2.3.0-darwin-arm64.tar.gz"
      sha256 "6724ac5a0e66338d388f813da055b1cabc2ba7ce42e215bf8378d05717710097"
    else
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/package-installer-cli-2.3.0-darwin-amd64.tar.gz"
      sha256 "b33ff3daad75f2377cfa471f35ddb1927bf530bb71bf57677a6580a46bd25ae3"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/package-installer-cli-2.3.0-linux-arm64.tar.gz"
      sha256 "0e7222bd468986995d39693684ebf459f42b5a7705b42e85d00f7cfa960edb6e"
    else
      url "https://github.com/0xshariq/package-installer-cli/releases/download/v2.3.0/package-installer-cli-2.3.0-linux-amd64.tar.gz"
      sha256 "4bb115b5fa7e7dee8bb97fbb0368d577f24ed019c9d5c3bf8a335d9ecaf17ae5"
    end
  end

  def install
    bin.install "package-installer-cli"
  end

  test do
    system "#{bin}/package-installer-cli", "--version"
  end
end
