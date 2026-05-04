#!/bin/bash

# Verification script for Iodlearn deployment configuration

echo "====================================="
echo "Iodlearn Deployment Verification"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 missing"
        ((FAIL++))
    fi
}

# Function to check file contains text
check_contains() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains: $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 missing: $2"
        ((FAIL++))
    fi
}

echo "Checking Frontend configuration..."
echo "-----------------------------------"
check_file "Frontend/vercel.json"
check_file "Frontend/_redirects"
check_file "Frontend/.vercel/project.json"
check_file "Frontend/.env"
check_contains "Frontend/.env" "VITE_API_BASE_URL=https://iodlearn.onrender.com/api"
check_file "Frontend/vite.config.js"
echo ""

echo "Checking Admin Panel configuration..."
echo "-------------------------------------"
check_file "Admin/vercel.json"
check_file "Admin/_redirects"
check_file "Admin/.vercel/project.json"
check_file "Admin/.env"
check_contains "Admin/.env" "VITE_API_BASE_URL=https://iodlearn.onrender.com/api"
check_file "Admin/nginx-vercel.conf"
echo ""

echo "Checking Backend configuration..."
echo "---------------------------------"
check_file "Backend/.env"
check_contains "Backend/.env" "CLIENT_URL=https://iodlearn.vercel.app"
check_contains "Backend/.env" "ADMIN_URL=https://iodlearn-admin.vercel.app"
check_file "Backend/index.js"
check_contains "Backend/index.js" "allowedOrigins"
echo ""

echo "Checking documentation..."
echo "-------------------------"
check_file "DEPLOYMENT.md"
check_file "DEPLOYMENT_CHANGES.md"
check_file "deploy.sh"
check_file "verify-deployment.sh"
echo ""

echo "====================================="
echo "Verification Results"
echo "====================================="
echo -e "Passed: ${GREEN}${PASS}${NC}"
echo -e "Failed: ${RED}${FAIL}${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. Please review.${NC}"
    exit 1
fi
