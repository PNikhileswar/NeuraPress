const puppeteer = require('puppeteer');

async function testAdminDashboard() {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI/CD
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/admin');
    
    // Wait for the page to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow');
    
    console.log('✅ Admin dashboard loaded successfully');
    
    // Check for the overview tab content
    const totalArticles = await page.$eval('.text-3xl.font-bold.text-blue-600', el => el.textContent);
    console.log(`📊 Total articles shown: ${totalArticles}`);
    
    // Click on the Articles tab
    await page.click('button[data-tab="articles"]');
    await page.waitForTimeout(1000);
    
    // Wait for the articles table to load
    await page.waitForSelector('table');
    
    // Check if delete buttons are present
    const deleteButtons = await page.$$('button:has-text("Delete")');
    console.log(`🗑️ Delete buttons found: ${deleteButtons.length}`);
    
    // Check table headers
    const headers = await page.$$eval('th', elements => 
      elements.map(el => el.textContent.trim())
    );
    console.log('📋 Table headers:', headers);
    
    // Check if we have articles in the table
    const articleRows = await page.$$('tbody tr');
    console.log(`📰 Article rows in table: ${articleRows.length}`);
    
    console.log('✅ Admin dashboard test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing admin dashboard:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Only run if puppeteer is available
try {
  testAdminDashboard();
} catch (error) {
  console.log('Note: Puppeteer not available for automated testing. Please test manually in browser.');
  console.log('Open http://localhost:3001/admin and check:');
  console.log('1. Overview shows correct article count (6)');
  console.log('2. Articles tab shows table with View and Delete buttons');
  console.log('3. Delete buttons trigger confirmation dialog');
  console.log('4. Deletion works and updates the table');
}
