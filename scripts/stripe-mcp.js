#!/usr/bin/env node
// Reads STRIPE_SECRET_KEY from .env.local and spawns the Stripe MCP server.
// Safe to commit — no keys are stored here.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('[stripe-mcp] .env.local not found at', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/^STRIPE_SECRET_KEY\s*=\s*(.+)$/m);

if (!match) {
  console.error('[stripe-mcp] STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const apiKey = match[1].trim();

const child = spawn('npx', ['-y', '@stripe/mcp', `--api-key=${apiKey}`], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
