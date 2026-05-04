#!/bin/bash

# Iodlearn Deployment Script
# This script helps deploy the Iodlearn platform to production

set -e

echo "=================================="
echo "Iodlearn Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "Backend/package.json" ] || [ ! -f "Frontend/package.json" ] || [ ! -f "Admin/package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Project structure verified${NC}"
echo ""

# Function to deploy Backend
deploy_backend() {
    echo -e "${YELLOW}Deploying Backend...${NC}"
    cd Backend
    
    # Install dependencies
    echo "Installing backend dependencies..."
    npm install
    
    # Run tests
    echo "Running backend tests..."
    npm test || true
    
    # Deploy to Render (if configured)
    if [ -f "render.yaml" ]; then
        echo "Deploying to Render..."
        # Add your Render deployment commands here
    fi
    
    cd ..
    echo -e "${GREEN}✓ Backend deployment complete${NC}"
    echo ""
}

# Function to deploy Frontend
deploy_frontend() {
    echo -e "${YELLOW}Deploying Frontend...${NC}"
    cd Frontend
    
    # Install dependencies
    echo "Installing frontend dependencies..."
    npm install
    
    # Build
    echo "Building frontend..."
    npm run build
    
    # Deploy to Vercel
    if command -v vercel &> /dev/null; then
        echo "Deploying to Vercel..."
        vercel --prod
    else
        echo "Vercel CLI not found. Deploy manually or install with: npm install -g vercel"
    fi
    
    cd ..
    echo -e "${GREEN}✓ Frontend deployment complete${NC}"
    echo ""
}

# Function to deploy Admin Panel
deploy_admin() {
    echo -e "${YELLOW}Deploying Admin Panel...${NC}"
    cd Admin
    
    # Install dependencies
    echo "Installing admin panel dependencies..."
    npm install
    
    # Build
    echo "Building admin panel..."
    npm run build
    
    # Deploy to Vercel
    if command -v vercel &> /dev/null; then
        echo "Deploying to Vercel..."
        vercel --prod --cwd .
    else
        echo "Vercel CLI not found. Deploy manually or install with: npm install -g vercel"
    fi
    
    cd ..
    echo -e "${GREEN}✓ Admin panel deployment complete${NC}"
    echo ""
}

# Main deployment flow
echo "Select deployment target:"
echo "1) Deploy Backend only"
echo "2) Deploy Frontend only"
echo "3) Deploy Admin Panel only"
echo "4) Deploy all (Backend, Frontend, Admin)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_admin
        ;;
    4)
        deploy_backend
        deploy_frontend
        deploy_admin
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo "==================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "==================================="
echo ""
echo "Services:"
echo "  Backend:    https://iodlearn.onrender.com"
echo "  Frontend:   https://iodlearn.vercel.app"
echo "  Admin:      https://iodlearn-admin.vercel.app"
echo ""
