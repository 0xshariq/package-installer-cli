# frozen_string_literal: true

require_relative "../lib/package_installer_cli"

RSpec.describe PackageInstallerCli do
  it "has a version number" do
    expect(PackageInstallerCli::VERSION).not_to be nil
  end

  describe ".run" do
    it "shows help by default" do
      expect { PackageInstallerCli.run([]) }.to output(/Package Installer CLI/).to_stdout
    end
    
    it "shows version when requested" do
      expect { PackageInstallerCli.run(['--version']) }.to output(/Package Installer CLI v#{PackageInstallerCli::VERSION}/).to_stdout
    end
    
    it "runs doctor command" do
      expect { PackageInstallerCli.run(['doctor']) }.to output(/Running system diagnostics/).to_stdout
    end
  end
end