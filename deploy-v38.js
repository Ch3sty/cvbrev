// Deploy script for v38
const fs = require('fs');

// Read the function file
const content = fs.readFileSync('supabase/functions/match-jobs/index.ts', 'utf8');

// Output as JSON for MCP consumption
const deployment = {
  name: 'match-jobs',
  files: [{
    name: 'index.ts',
    content: content
  }]
};

// Write to stdout for piping
console.log(JSON.stringify(deployment));
