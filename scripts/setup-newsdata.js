#!/usr/bin/env node
/**
 * NewsData.io Setup Script
 * 
 * This script helps you set up newsdata.io integration quickly
 */
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.log('\nðŸš€ NeuraPress NewsData.io Setup\n');
console.log('This script will help you configure newsdata.io integration.\n');
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}
async function main() {
  try {
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    console.log('ðŸ“‹ Step 1: Get your NewsData.io API Key');
    console.log('   1. Go to https://newsdata.io/');
    console.log('   2. Sign up for a free account');
    console.log('   3. Copy your API key from the dashboard\n');
    const apiKey = await question('ðŸ”‘ Enter your NewsData.io API key: ');
    if (!apiKey || apiKey.trim() === '') {
      console.log('âŒ API key is required. Please run the script again.');
      process.exit(1);
    }
    // Read existing .env.local or create from example
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('\nðŸ“„ Found existing .env.local file');
    } else if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
      console.log('\nðŸ“„ Creating .env.local from .env.example');
    } else {
      console.log('\nðŸ“„ Creating new .env.local file');
    }
    // Update or add NEWSDATA_API_KEY
    const lines = envContent.split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('NEWSDATA_API_KEY=') || lines[i].startsWith('# NEWSDATA_API_KEY=')) {
        lines[i] = `NEWSDATA_API_KEY=${apiKey.trim()}`;
        found = true;
        break;
      }
      // Also replace old NEWS_API_KEY if it exists
      if (lines[i].startsWith('NEWS_API_KEY=') || lines[i].startsWith('# NEWS_API_KEY=')) {
        lines[i] = `NEWSDATA_API_KEY=${apiKey.trim()}`;
        found = true;
        break;
      }
    }
    if (!found) {
      // Add the API key at the end
      lines.push('');
      lines.push('# NewsData.io API Key');
      lines.push(`NEWSDATA_API_KEY=${apiKey.trim()}`);
    }
    // Write the file
    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('\nâœ… Configuration saved to .env.local');
    console.log('\nðŸ“Š NewsData.io Features Available:');
    console.log('   â€¢ 200 requests/day (free tier)');
    console.log('   â€¢ 80,000+ news sources worldwide');
    console.log('   â€¢ Real-time trending topics');
    console.log('   â€¢ 10 major categories supported');
    console.log('   â€¢ Auto-extracted keywords');
    console.log('   â€¢ Multi-language support');
    console.log('\nðŸŽ¯ Next Steps:');
    console.log('   1. Restart your development server: npm run dev');
    console.log('   2. Navigate to your trending topics page');
    console.log('   3. Try generating articles - you should see diverse content!');
    console.log('\nðŸ“š Categories Supported:');
    const categories = [
      'Technology', 'Business', 'Health', 'Science', 
      'Sports', 'Politics', 'Entertainment', 'Environment',
      'Finance', 'Lifestyle'
    ];
    console.log('   ' + categories.join(', '));
    console.log('\nðŸ”§ Troubleshooting:');
    console.log('   â€¢ If you get rate limit errors, check your usage at newsdata.io dashboard');
    console.log('   â€¢ For production apps, consider upgrading to a paid plan');
    console.log('   â€¢ Check the NEWSDATA_IO_INTEGRATION.md file for detailed documentation');
    const testNow = await question('\nðŸ§ª Would you like to test the API connection now? (y/n): ');
    if (testNow.toLowerCase().startsWith('y')) {
      console.log('\nðŸ” Testing API connection...');
      try {
        const fetch = require('node-fetch');
        const testUrl = `https://newsdata.io/api/1/news?apikey=${apiKey.trim()}&language=en&size=1`;
        const response = await fetch(testUrl);
        const data = await response.json();
        if (data.status === 'success') {
          console.log('âœ… API connection successful!');
          console.log(`ðŸ“° Sample article: "${data.results[0].title}"`);
        } else {
          console.log('âŒ API test failed:', data.error || 'Unknown error');
        }
      } catch (error) {
        console.log('âŒ API test failed:', error.message);
        console.log('   Don\'t worry - this might be due to missing node-fetch.');
        console.log('   The API key should still work in your Next.js app.');
      }
    }
    console.log('\nðŸŽ‰ Setup complete! Happy trending! ðŸš€\n');
  } catch (error) {
    console.error('âŒ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}
main();