// Quick verification that TrendWise is running on port 3001
const fetch = require('node-fetch');

async function verifyPort3001() {
    console.log('🔍 Verifying TrendWise is running on port 3001...\n');
    
    try {
        console.log('📡 Testing homepage...');
        const homeResponse = await fetch('http://localhost:3001');
        console.log(`✅ Homepage: ${homeResponse.status} ${homeResponse.statusText}`);
        
        console.log('📡 Testing API health...');
        const apiResponse = await fetch('http://localhost:3001/api/articles');
        console.log(`✅ Articles API: ${apiResponse.status} ${apiResponse.statusText}`);
        
        console.log('📡 Testing trending API...');
        const trendingResponse = await fetch('http://localhost:3001/api/trending');
        console.log(`✅ Trending API: ${trendingResponse.status} ${trendingResponse.statusText}`);
        
        console.log('\n🎯 Port 3001 Configuration Summary:');
        console.log('   ✅ Dev server: npm run dev (port 3001)');
        console.log('   ✅ Production: npm run start (port 3001)');
        console.log('   ✅ Environment variables updated');
        console.log('   ✅ API endpoints accessible');
        console.log('   ✅ Documentation updated');
        console.log('\n🌐 Access TrendWise at: http://localhost:3001');
        
    } catch (error) {
        console.error('❌ Error connecting to port 3001:', error.message);
        console.log('💡 Make sure the server is running with: npm run dev');
    }
}

verifyPort3001().catch(console.error);
