#!/usr/bin/env node

/**
 * Pre-deployment test for Iodlearn platform
 * Verifies all production URLs are correctly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

let passed = 0;
let failed = 0;

function check(condition, message) {
    if (condition) {
        console.log(`${colors.green}✓${colors.reset} ${message}`);
        passed++;
    } else {
        console.log(`${colors.red}✗${colors.reset} ${message}`);
        failed++;
    }
}

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}Iodlearn Deployment Configuration Test${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

// Test 1: Frontend configuration
console.log('Frontend Configuration:');
console.log('-----------------------');
try {
    const frontendEnv = fs.readFileSync(path.join(__dirname, 'Frontend', '.env'), 'utf8');
    check(
        frontendEnv.includes('VITE_API_BASE_URL=https://iodlearn.onrender.com/api'),
        'Frontend .env has correct API URL'
    );
} catch (e) {
    check(false, 'Frontend .env file exists');
}

try {
    const viteConfig = fs.readFileSync(path.join(__dirname, 'Frontend', 'vite.config.js'), 'utf8');
    check(
        viteConfig.includes('historyApiFallback'),
        'Frontend has historyApiFallback enabled'
    );
    check(
        viteConfig.includes('/api'),
        'Frontend proxy configured for /api'
    );
} catch (e) {
    check(false, 'Frontend vite.config.js exists');
}

console.log();

// Test 2: Admin Panel configuration
console.log('Admin Panel Configuration:');
console.log('---------------------------');
try {
    const adminEnv = fs.readFileSync(path.join(__dirname, 'Admin', '.env'), 'utf8');
    check(
        adminEnv.includes('VITE_API_BASE_URL=https://iodlearn.onrender.com/api'),
        'Admin .env has correct API URL'
    );
} catch (e) {
    check(false, 'Admin .env file exists');
}

try {
    const vercelJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'Admin', 'vercel.json'), 'utf8'));
    check(
        vercelJson.routes && vercelJson.routes.length > 0,
        'Admin vercel.json has routes configuration'
    );
    check(
        vercelJson.outputDirectory === 'dist',
        'Admin output directory is dist'
    );
} catch (e) {
    check(false, 'Admin vercel.json is valid');
}

try {
    const redirects = fs.readFileSync(path.join(__dirname, 'Admin', '_redirects'), 'utf8');
    check(
        redirects.includes('/*') && redirects.includes('/index.html'),
        'Admin _redirects has SPA fallback'
    );
} catch (e) {
    check(false, 'Admin _redirects file exists');
}

console.log();

// Test 3: Backend configuration
console.log('Backend Configuration:');
console.log('-----------------------');
try {
    const backendEnv = fs.readFileSync(path.join(__dirname, 'Backend', '.env'), 'utf8');
    check(
        backendEnv.includes('CLIENT_URL=https://iodlearn.vercel.app'),
        'Backend CLIENT_URL is correct'
    );
    check(
        backendEnv.includes('ADMIN_URL=https://iodlearn-admin.vercel.app'),
        'Backend ADMIN_URL is correct'
    );
    check(
        backendEnv.includes('CLIENT_BASE_URL=https://iodlearn.vercel.app'),
        'Backend CLIENT_BASE_URL is correct'
    );
} catch (e) {
    check(false, 'Backend .env file exists');
}

try {
    const indexJs = fs.readFileSync(path.join(__dirname, 'Backend', 'index.js'), 'utf8');
    check(
        indexJs.includes('allowedOrigins'),
        'Backend has allowedOrigins array'
    );
    check(
        indexJs.includes('iodlearn.vercel.app'),
        'Backend allows production frontend origin'
    );
    check(
        indexJs.includes('iodlearn-admin.vercel.app'),
        'Backend allows production admin origin'
    );
} catch (e) {
    check(false, 'Backend index.js exists');
}

console.log();

// Test 4: Production URLs summary
console.log('Production URLs:');
console.log('----------------');
console.log(`  Frontend:    https://iodlearn.vercel.app`);
console.log(`  Admin:       https://iodlearn-admin.vercel.app`);
console.log(`  Backend API: https://iodlearn.onrender.com`);
console.log(`  API Base:    https://iodlearn.onrender.com/api`);
console.log();

// Test 5: Verify no production localhost in .env files
console.log('Security Checks:');
console.log('----------------');
const envFiles = [
    'Frontend/.env',
    'Admin/.env',
    'Backend/.env'
];

envFiles.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        const hasProductionLocalhost = 
            content.includes('http://localhost') && 
            !content.includes('||') && 
            !content.includes('|| ');
        
        if (content.includes('VITE_API_BASE_URL=https') || 
            content.includes('CLIENT_URL=https') ||
            content.includes('ADMIN_URL=https')) {
            check(
                !hasProductionLocalhost,
                `${file} uses production URLs (not localhost)`
            );
        }
    } catch (e) {
        // File doesn't exist, but that's caught by other tests
    }
});

console.log();
console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}Test Results${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}\n`);

if (failed === 0) {
    console.log(`${colors.green}✓ All deployment tests passed!${colors.reset}`);
    console.log('\nThe admin 404 error should be resolved after deployment.');
    console.log('Deploy with confidence! 🚀\n');
    process.exit(0);
} else {
    console.log(`${colors.red}✗ Some tests failed. Please review before deploying.${colors.reset}\n`);
    process.exit(1);
}
