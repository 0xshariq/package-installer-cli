#!/bin/bash

# CLI Demo Script for Package Installer CLI
echo "🚀 Package Installer CLI Demo"
echo "=============================="
echo ""

# Simulate typing with delays
type_command() {
    local cmd="$1"
    local delay="${2:-0.05}"
    
    for ((i=0; i<${#cmd}; i++)); do
        printf "%s" "${cmd:$i:1}"
        sleep $delay
    done
}

# Demo commands
echo "📦 Creating a new Next.js project..."
type_command "pi create my-nextjs-app"
echo ""
echo "✨ Project created successfully!"
echo ""

sleep 1

echo "🔧 Adding authentication..."
type_command "pi add auth"
echo ""
echo "🔐 Clerk authentication added!"
echo ""

sleep 1

echo "🚀 Deploying to Vercel..."
type_command "pi deploy --auto-detect"
echo ""
echo "🌐 Deployed successfully!"
echo ""

echo "🎉 Done! Your app is ready at https://my-nextjs-app.vercel.app"