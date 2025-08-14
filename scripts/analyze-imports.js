#!/usr/bin/env node
/**
 * Migration Script for TrendWise Project Structure Update
 * This script helps identify files that need import path updates
 */
const fs = require('fs');
const path = require('path');
// Import mappings for the new structure
const importMappings = {
  // Components
  "from '../../../components/": "from '@/components/",
  "from '../../components/": "from '@/components/",
  "from '../components/": "from '@/components/",
  "from './components/": "from '@/components/",
  "from 'components/": "from '@/components/",
  // Lib mappings
  "from '../../../lib/": "from '@/lib/",
  "from '../../lib/": "from '@/lib/",
  "from '../lib/": "from '@/lib/",
  "from './lib/": "from '@/lib/",
  "from 'lib/": "from '@/lib/",
  // Hooks
  "from '../../../hooks/": "from '@/hooks/",
  "from '../../hooks/": "from '@/hooks/",
  "from '../hooks/": "from '@/hooks/",
  "from './hooks/": "from '@/hooks/",
  "from 'hooks/": "from '@/hooks/",
  // Types  
  "from '../../../types/": "from '@/types/",
  "from '../../types/": "from '@/types/",
  "from '../types/": "from '@/types/",
  "from './types/": "from '@/types/",
  "from 'types/": "from '@/types/",
  // Specific component updates
  "from '@/components/Header'": "from '@/components/layout/Header'",
  "from '@/components/Footer'": "from '@/components/layout/Footer'",
  "from '@/components/AdminDashboard'": "from '@/components/admin/AdminDashboard'",
  "from '@/components/OptimizedImage'": "from '@/components/ui/OptimizedImage'",
  // Lib specific updates
  "from '@/lib/mongodb'": "from '@/lib/database/mongodb'",
  "from '@/lib/auth'": "from '@/lib/config/auth'",
  "from '@/lib/openai'": "from '@/lib/services/openai'",
  "from '@/lib/utils'": "from '@/lib/utils/utils'",
};
function findFilesToUpdate(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !['node_modules', '.next', '.git', 'src'].includes(item)) {
      files.push(...findFilesToUpdate(fullPath));
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updates = [];
  for (const [oldPattern, newPattern] of Object.entries(importMappings)) {
    if (content.includes(oldPattern)) {
      updates.push({ from: oldPattern, to: newPattern });
    }
  }
  return updates.length > 0 ? { file: filePath, updates } : null;
}
function main() {
  console.log('ðŸ” Analyzing TrendWise project for import path updates...\n');
  const projectRoot = process.cwd();
  const filesToCheck = findFilesToUpdate(projectRoot);
  const filesToUpdate = [];
  for (const file of filesToCheck) {
    const analysis = analyzeFile(file);
    if (analysis) {
      filesToUpdate.push(analysis);
    }
  }
  if (filesToUpdate.length === 0) {
    console.log('âœ… No import path updates needed!');
    return;
  }
  console.log(`ðŸ“ Found ${filesToUpdate.length} files that need import updates:\n`);
  for (const { file, updates } of filesToUpdate) {
    console.log(`ðŸ“„ ${path.relative(projectRoot, file)}`);
    for (const { from, to } of updates) {
      console.log(`   ${from} â†’ ${to}`);
    }
    console.log('');
  }
  console.log('\nðŸ› ï¸  To update these files, you can:');
  console.log('1. Use your IDE\'s find-and-replace feature');
  console.log('2. Use sed commands (Linux/Mac)');
  console.log('3. Update manually\n');
  console.log('ðŸ“š Refer to FOLDER_STRUCTURE.md for the complete new structure.');
}
if (require.main === module) {
  main();
}