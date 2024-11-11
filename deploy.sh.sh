#!/bin/bash

# Deployment script for Learning Platform
# This script handles both Vercel and traditional server deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    if ! command_exists node; then
        echo -e "${RED}Node.js is not installed. Please install Node.js v16 or later.${NC}"
        exit 1
    fi
    
    if ! command_exists npm; then
        echo -e "${RED}npm is not installed. Please install npm.${NC}"
        exit 1
    fi
    
    if ! command_exists git; then
        echo -e "${RED}git is not installed. Please install git.${NC}"
        exit 1
    fi
}

# Function to setup environment variables
setup_env() {
    echo -e "${BLUE}Setting up environment variables...${NC}"
    
    if [ ! -f .env.production ]; then
        echo "Creating .env.production file..."
        cat > .env.production << EOL
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=https://your-production-api-url.com
DATABASE_URL=your-database-url
NEXT_PUBLIC_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
EOL
        echo -e "${RED}Please update the values in .env.production with your actual credentials${NC}"
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "${BLUE}Deploying to Vercel...${NC}"
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Create vercel.json if it doesn't exist
    if [ ! -f vercel.json ]; then
        echo "Creating vercel.json..."
        cat > vercel.json << EOL
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOL
    fi
    
    # Deploy to Vercel
    echo "Deploying to Vercel..."
    vercel --prod
}

# Function to build for traditional server deployment
build_traditional() {
    echo -e "${BLUE}Building for traditional server deployment...${NC}"
    
    # Install dependencies
    npm install
    
    # Build the application
    npm run build
    
    echo -e "${GREEN}Build completed. The build files are in the .next directory.${NC}"
    echo -e "${BLUE}To deploy to your server, use:${NC}"
    echo "scp -r .next/* user@your-server:/path/to/deployment"
}

# Main deployment script
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_env
    
    # Ask for deployment type
    echo -e "${BLUE}Select deployment type:${NC}"
    echo "1) Vercel (Recommended)"
    echo "2) Traditional Server"
    read -p "Enter your choice (1 or 2): " deployment_choice
    
    case $deployment_choice in
        1)
            deploy_vercel
            ;;
        2)
            build_traditional
            ;;
        *)
            echo -e "${RED}Invalid choice. Exiting.${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}Deployment process completed!${NC}"
    echo -e "${BLUE}Post-deployment checklist:${NC}"
    echo "1. Verify all routes are working"
    echo "2. Check authentication flows"
    echo "3. Validate API connections"
    echo "4. Test file uploads"
    echo "5. Monitor error reporting"
    echo "6. Check analytics integration"
    echo "7. Verify SSL certificate"
    echo "8. Test mobile responsiveness"
}

# Run the script
main
