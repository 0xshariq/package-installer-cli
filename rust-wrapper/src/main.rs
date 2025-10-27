use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    // Check if the binary name contains "package-installer" or "pi" or if first argument is "pi"
    let binary_name = &args[0];
    let should_run_cli = binary_name.contains("package-installer") || 
                        binary_name.contains("pi") || 
                        (args.len() > 1 && args[1] == "pi");
    
    if should_run_cli {
        // Get CLI arguments - pass all arguments after the binary name
        let cli_args = if binary_name.contains("package-installer") || binary_name.contains("pi") {
            args.iter().skip(1).cloned().collect::<Vec<String>>()
        } else {
            args.iter().skip(2).cloned().collect::<Vec<String>>()
        };
        
        // Find and run the bundled CLI
        match run_bundled_cli(&cli_args) {
            Ok(exit_code) => {
                std::process::exit(exit_code);
            }
            Err(e) => {
                println!("❌ Failed to execute the CLI: {}", e);
                print_usage_instructions();
                std::process::exit(1);
            }
        }
    } else {
        println!("Usage: pi [command] [options]");
        println!("This is a Rust wrapper for the Package Installer CLI.");
        println!("Use the binary name directly followed by your command to run the CLI.");
        println!("Example: pi create my-app");
        std::process::exit(1);
    }
}

fn run_bundled_cli(cli_args: &[String]) -> Result<i32, Box<dyn std::error::Error>> {
    // Try different bundled CLI locations in order of preference
    
    // 1. Check for local npm installation first (highest priority)
    if let Ok(exit_code) = try_local_npm_installation(cli_args) {
        return Ok(exit_code);
    }
    
    // 2. Try bundled standalone pi executable relative to this binary
    if let Ok(exit_code) = try_bundled_pi_executable(cli_args) {
        return Ok(exit_code);
    }
    
    // 3. Try bundled standalone pi executable in development location
    if let Ok(exit_code) = try_bundled_pi_development(cli_args) {
        return Ok(exit_code);
    }
    
    Err("No CLI installation found".into())
}

fn try_local_npm_installation(cli_args: &[String]) -> Result<i32, Box<dyn std::error::Error>> {
    let current_dir = env::current_dir()?;
    
    // Check for local npm installations
    let local_paths = vec![
        current_dir.join("node_modules").join("@0xshariq").join("package-installer").join("dist").join("index.js"),
        current_dir.join("node_modules").join("package-installer-cli").join("dist").join("index.js"),
    ];
    
    for path in &local_paths {
        if path.exists() {
            println!("✅ Using locally installed CLI from node_modules");
            return run_node_cli(path, cli_args);
        }
    }
    
    // Check parent directories (up to 5 levels) for local npm installations
    let mut check_dir = current_dir.as_path();
    for _ in 0..5 {
        for local_path in &[
            "node_modules/@0xshariq/package-installer/dist/index.js",
            "node_modules/package-installer-cli/dist/index.js",
        ] {
            let full_path = check_dir.join(local_path);
            if full_path.exists() {
                println!("✅ Using locally installed CLI from node_modules");
                return run_node_cli(&full_path, cli_args);
            }
        }
        
        if let Some(parent) = check_dir.parent() {
            check_dir = parent;
        } else {
            break;
        }
    }
    
    Err("No local npm installation found".into())
}

fn try_bundled_pi_executable(cli_args: &[String]) -> Result<i32, Box<dyn std::error::Error>> {
    // Get the directory where this binary is located
    let exe_path = env::current_exe()?;
    let exe_dir = exe_path.parent().ok_or("Cannot determine executable directory")?;
    
    // Check for bundled pi executable relative to the binary
    let bundled_pi_path = exe_dir.join("bundle-standalone").join("pi");
    
    if bundled_pi_path.exists() {
        println!("✅ Using bundled standalone pi executable");
        return run_pi_executable(&bundled_pi_path, cli_args);
    }
    
    Err("Bundled pi executable not found relative to binary".into())
}

fn try_bundled_pi_development(cli_args: &[String]) -> Result<i32, Box<dyn std::error::Error>> {
    // Check in the current working directory (for development)
    let current_dir = env::current_dir()?;
    let bundled_pi_dev_path = current_dir.join("bundle-standalone").join("pi");
    
    if bundled_pi_dev_path.exists() {
        println!("✅ Using bundled standalone pi executable (development)");
        return run_pi_executable(&bundled_pi_dev_path, cli_args);
    }
    
    Err("Bundled pi executable not found in development location".into())
}

fn run_node_cli(cli_path: &Path, cli_args: &[String]) -> Result<i32, Box<dyn std::error::Error>> {
    let status = Command::new("node")
        .arg(cli_path)
        .args(cli_args)
        .status()
        .map_err(|e| format!("Failed to run Node.js CLI. Make sure Node.js is installed: {}", e))?;
    
    Ok(status.code().unwrap_or(1))
}

fn run_pi_executable(pi_path: &Path, cli_args: &[String]) -> Result<i32, Box<dyn std::error::Error>> {
    let status = Command::new(pi_path)
        .args(cli_args)
        .status()
        .map_err(|e| format!("Failed to run pi executable: {}", e))?;
    
    Ok(status.code().unwrap_or(1))
}

fn print_usage_instructions() {
    println!("\n📋 CLI NOT FOUND:");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("The Package Installer CLI was not found. Here are your options:");
    println!("");
    
    println!("🌍 OPTION 1: Install locally via npm (Recommended)");
    println!("   npm install @0xshariq/package-installer");
    println!("   npx pi create my-app");
    println!("");
    
    println!("🔧 OPTION 2: Use the bundled version");
    println!("   Make sure the 'bundle-standalone/' directory is available alongside this executable");
    println!("   The bundle should contain: bundle-standalone/pi (bundled executable)");
    println!("");
    
    println!("💡 REQUIREMENTS:");
    println!("   - For npm version: Install Node.js from https://nodejs.org");
    println!("   - For bundled version: No additional requirements");
    
    println!("");
    println!("🔗 More info: https://github.com/0xshariq/rust_package_installer_cli");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
