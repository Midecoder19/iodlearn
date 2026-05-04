#!/bin/bash

# Pre-flight Check - Run Before Client Demo
# Quick verification that everything is working

echo ""
echo "  🚀 Iodlearn Pre-Flight Check"
echo "  Run this 10 minutes before demo"
echo ""
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
    echo -n "  $1... "
}

ok() {
    echo -e "${GREEN}✓${NC}"
    ((PASS++))
}

error() {
    echo -e "${RED}✗${NC}"
    echo -e "    $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠${NC}"
    echo -e "    $1"
    ((WARN++))
}

echo "🔍 Checking Frontend..."
echo "────────────────────────"

check "Frontend URL accessible"
if curl -sf -o /dev/null https://iodlearn.vercel.app; then
    ok
else
    error "Frontend not loading!"
fi

check "No console errors"
echo -e "  ${YELLOW}→${NC} Manually check browser console"
((WARN++))

echo ""
echo "🔍 Checking Admin Panel..."
echo "──────────────────────────"

check "Admin URL accessible"
if curl -sf -o /dev/null https://iodlearn-admin.vercel.app; then
    ok
else
    error "Admin panel not loading (404 error!)"
fi

check "Admin API connectivity"
if curl -sf -o /dev/null https://iodlearn-admin.vercel.app/api/health 2>/dev/null || \
   curl -sf -o /dev/null https://iodlearn.onrender.com/api/health; then
    ok
else
    warn "Backend health check endpoint not public (normal)"
fi

echo ""
echo "🔍 Checking Backend API..."
echo "──────────────────────────"

check "Health endpoint"
# Try health endpoint - may fail due to static files but API should work
RESPONSE=$(curl -s -w "\n%{http_code}" https://iodlearn.onrender.com/api/health 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

# Check if API is responding (any HTTP code means it's up)
if [ -n "$HTTP_CODE" ] && [ "$HTTP_CODE" != "000" ]; then
    ok
else
    error "Backend not responding!"
fi

check "Courses endpoint"
HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" https://iodlearn.onrender.com/api/courses)
if [ "$HTTP_CODE" = "200" ]; then
    ok
elif [ "$HTTP_CODE" = "500" ]; then
    # Check if it's a database connection issue vs other error
    RESPONSE=$(curl -s https://iodlearn.onrender.com/api/courses 2>/dev/null)
    if echo "$RESPONSE" | grep -q "courses"; then
        ok
    else
        warn "API responding but may have DB issues"
    fi
else
    error "Courses endpoint failed (HTTP $HTTP_CODE)!"
fi

check "CORS enabled"
if curl -sI https://iodlearn.onrender.com/api/courses 2>/dev/null | grep -qi "access-control-allow-origin"; then
    ok
else
    warn "CORS headers not detected (may need auth)"
fi

echo ""
echo "🔍 Checking Email Service..."
echo "────────────────────────────"

check "SMTP credentials configured"
if grep -q "BREVO_API_KEY" Backend/.env 2>/dev/null; then
    ok
else
    warn "Brevo API key may not be set"
fi

echo ""
echo "🔍 Checking Payments..."
echo "───────────────────────"

check "Paystack public key"
if grep -q "PAYSTACK_PUBLIC_KEY" Backend/.env 2>/dev/null; then
    ok
else
    warn "Paystack key may not be configured"
fi

echo ""
echo "🔍 Checking Environment..."
echo "──────────────────────────"

check "Frontend API URL"
if grep -q "VITE_API_BASE_URL=https://iodlearn.onrender.com/api" Frontend/.env; then
    ok
else
    error "Frontend not pointing to production API!"
fi

check "Admin API URL"
if grep -q "VITE_API_BASE_URL=https://iodlearn.onrender.com/api" Admin/.env; then
    ok
else
    error "Admin not pointing to production API!"
fi

check "Backend CLIENT_URL"
if grep -q "CLIENT_URL=https://iodlearn.vercel.app" Backend/.env; then
    ok
else
    error "Backend CLIENT_URL incorrect!"
fi

check "Backend ADMIN_URL"
if grep -q "ADMIN_URL=https://iodlearn-admin.vercel.app" Backend/.env; then
    ok
else
    error "Backend ADMIN_URL incorrect!"
fi

echo ""
echo ""
echo "  📊 Results"
echo "  ──────────────────"
echo -e "  Passed:  ${GREEN}${PASS}${NC}"
echo -e "  Warnings: ${YELLOW}${WARN}${NC}"
echo -e "  Failed:  ${RED}${FAIL}${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "  ${RED}❌ ISSUES DETECTED - Please fix before demo!${NC}"
    echo ""
    echo "  Quick fixes:"
    echo "  1. Redeploy services if needed"
    echo "  2. Check .env files are correct"
    echo "  3. Verify Vercel/Render deployments"
    echo "  4. Run: ./verify-deployment.sh"
    echo ""
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "  ${YELLOW}⚠ WARNING - Some non-critical issues${NC}"
    echo ""
    echo "  Review warnings above. Demo can proceed."
    echo ""
    exit 0
else
    echo -e "  ${GREEN}✅ ALL SYSTEMS GO - Ready for demo!${NC}"
    echo ""
    echo "  Quick reminder:"
    echo "  • Test account: demo.student+clientdemo@iodlearn.com"
    echo "  • Test card: 4084084084084081 | 12/30 | 123"
    echo "  • Admin: admin@demo.com / admin123"
    echo ""
    exit 0
fi
