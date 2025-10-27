
package main

import (
	"embed"
	"fmt"
	"io/fs"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)


const (
	appName    = "Package Installer CLI"
	appVersion = "2.0.0"
)

//go:embed bundle-executables/**
var embeddedBundle embed.FS


func main() {
	// 1. Extract embedded bundle to a temp directory
	tempDir, err := ioutil.TempDir("", "pi-bundle-*")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating temp directory: %v\n", err)
		os.Exit(1)
	}
	defer os.RemoveAll(tempDir)

	// Copy all embedded files to tempDir
	err = fs.WalkDir(embeddedBundle, "bundle-executables", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		relPath := strings.TrimPrefix(path, "bundle-executables/")
		if relPath == "" {
			return nil
		}
		outPath := filepath.Join(tempDir, relPath)
		if d.IsDir() {
			return os.MkdirAll(outPath, 0755)
		}
		data, err := embeddedBundle.ReadFile(path)
		if err != nil {
			return err
		}
		return ioutil.WriteFile(outPath, data, 0755)
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error extracting embedded bundle: %v\n", err)
		os.Exit(1)
	}

	// 2. Determine the correct script to run based on platform
	var scriptPath string
	switch runtime.GOOS {
	case "windows":
		scriptPath = filepath.Join(tempDir, "pi.bat")
		if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
			scriptPath = filepath.Join(tempDir, "pi.exe")
		}
	case "darwin":
		scriptPath = filepath.Join(tempDir, "pi-macos")
		if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
			scriptPath = filepath.Join(tempDir, "pi")
		}
	default:
		scriptPath = filepath.Join(tempDir, "pi")
	}

	// Make sure the script is executable (for Unix)
	if runtime.GOOS != "windows" {
		os.Chmod(scriptPath, 0755)
	}

	// 3. Prepare the command to run the script, passing all arguments
	args := os.Args[1:]
	cmd := exec.Command(scriptPath, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	// 4. Run the script and exit with the same code
	if err := cmd.Run(); err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			os.Exit(exitError.ExitCode())
		}
		fmt.Fprintf(os.Stderr, "Error executing pi script: %v\n", err)
		os.Exit(1)
	}
}

// isNodeAvailable checks if Node.js is available in the system PATH
func isNodeAvailable() bool {
	var cmd *exec.Cmd
	
	if runtime.GOOS == "windows" {
		cmd = exec.Command("cmd", "/c", "node", "--version")
	} else {
		cmd = exec.Command("node", "--version")
	}
	
	return cmd.Run() == nil
}

// areDependenciesInstalled checks if Node.js dependencies are installed
func areDependenciesInstalled(execDir string) bool {
	// Check if node_modules directory exists
	nodeModulesPath := filepath.Join(execDir, "node_modules")
	if _, err := os.Stat(nodeModulesPath); os.IsNotExist(err) {
		return false
	}
	
	// Check if package.json exists (indicating dependencies are needed)
	packageJsonPath := filepath.Join(execDir, "package.json")
	if _, err := os.Stat(packageJsonPath); os.IsNotExist(err) {
		// No package.json means dependencies might be bundled
		return true
	}
	
	// Try to run a simple node command to test if dependencies work
	testCmd := exec.Command("node", "-e", "require('commander')")
	testCmd.Dir = execDir
	return testCmd.Run() == nil
}

// runSetupScript executes the appropriate setup script based on the platform
func runSetupScript(execDir string) error {
	var setupScript string
	var cmd *exec.Cmd
	
	if runtime.GOOS == "windows" {
		setupScript = filepath.Join(execDir, "setup.bat")
		if _, err := os.Stat(setupScript); os.IsNotExist(err) {
			return fmt.Errorf("setup.bat not found")
		}
		cmd = exec.Command("cmd", "/c", setupScript)
	} else {
		setupScript = filepath.Join(execDir, "setup.sh")
		if _, err := os.Stat(setupScript); os.IsNotExist(err) {
			return fmt.Errorf("setup.sh not found")
		}
		// Make sure the script is executable
		os.Chmod(setupScript, 0755)
		cmd = exec.Command("bash", setupScript)
	}
	
	cmd.Dir = execDir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	
	fmt.Printf("Running setup script: %s\n", setupScript)
	
	// Add a small delay to show the message
	time.Sleep(500 * time.Millisecond)
	
	return cmd.Run()
}