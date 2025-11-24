#!/usr/bin/env node

// Quick configuration test
const fs = require('fs');
const path = require('path');

console.log('🔍 Bitcoin Whale Tracker - Configuration Check\n');

const checks = {
  pass: 0,
  warn: 0,
  fail: 0
};

function check(name, condition, level = 'fail') {
  const symbol = condition ? '✅' : (level === 'warn' ? '⚠️ ' : '❌');
  console.log(`${symbol} ${name}`);
  if (condition) {
    checks.pass++;
  } else {
    checks[level]++;
  }
  return condition;
}

// Check files exist
console.log('📁 File Structure:');
check('Root vercel.json exists', fs.existsSync('./vercel.json'));
check('Backend vercel.json exists', fs.existsSync('./backend/vercel.json'));
check('Frontend vercel.json exists', fs.existsSync('./frontend/vercel.json'));
check('Prisma schema exists', fs.existsSync('./backend/prisma/schema.prisma'));
check('.vercelignore exists', fs.existsSync('./.vercelignore'));
check('VERCEL_DEPLOYMENT.md exists', fs.existsSync('./VERCEL_DEPLOYMENT.md'));
check('QUICK_START.md exists', fs.existsSync('./QUICK_START.md'));
check('ENV_VARIABLES.md exists', fs.existsSync('./ENV_VARIABLES.md'));
check('DEPLOYMENT_CHECKLIST.md exists', fs.existsSync('./DEPLOYMENT_CHECKLIST.md'));

console.log('\n📦 Dependencies:');
const rootPkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const backendPkg = JSON.parse(fs.readFileSync('./backend/package.json', 'utf8'));
const frontendPkg = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8'));

check('Root package.json has vercel-build script', !!rootPkg.scripts['vercel-build']);
check('Backend has prisma', !!backendPkg.dependencies['@prisma/client']);
check('Frontend has react', !!frontendPkg.dependencies['react']);
check('Frontend has vite', !!frontendPkg.devDependencies['vite']);

console.log('\n⚙️  Configuration:');
const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
check('Vercel config has builds', !!vercelConfig.builds);
check('Vercel config has routes', !!vercelConfig.routes);

console.log('\n🔧 Build Scripts:');
check('Root has install:all script', !!rootPkg.scripts['install:all']);
check('Root has build script', !!rootPkg.scripts['build']);
check('Backend has build script', !!backendPkg.scripts['build']);
check('Frontend has build script', !!frontendPkg.scripts['build']);
check('Frontend has vercel-build script', !!frontendPkg.scripts['vercel-build']);

console.log('\n🗄️  Database:');
const schemaExists = fs.existsSync('./backend/prisma/schema.prisma');
if (schemaExists) {
  const schema = fs.readFileSync('./backend/prisma/schema.prisma', 'utf8');
  check('Schema has datasource', schema.includes('datasource db'));
  check('Schema has generator', schema.includes('generator client'));
  check('Schema has models', schema.includes('model '));
}

console.log('\n🎯 Ready for Deployment:');
const hasGit = fs.existsSync('./.git');
check('Git repository initialized', hasGit);
const hasGitignore = fs.existsSync('./.gitignore');
check('.gitignore exists', hasGitignore);
if (hasGitignore) {
  const gitignore = fs.readFileSync('./.gitignore', 'utf8');
  check('.env is gitignored', gitignore.includes('.env'));
  check('node_modules is gitignored', gitignore.includes('node_modules'));
}

console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${checks.pass}`);
console.log(`⚠️  Warnings: ${checks.warn}`);
console.log(`❌ Failed: ${checks.fail}`);
console.log('='.repeat(50));

if (checks.fail === 0) {
  console.log('\n🎉 All checks passed! Ready for Vercel deployment.');
  console.log('\nNext steps:');
  console.log('1. Read QUICK_START.md for deployment instructions');
  console.log('2. Set up database (Vercel Postgres or Neon)');
  console.log('3. Push to GitHub: git push origin main');
  console.log('4. Deploy to Vercel: https://vercel.com/new');
} else {
  console.log('\n⚠️  Some checks failed. Review the issues above.');
}
