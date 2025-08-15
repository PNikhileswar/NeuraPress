require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
async function makeAdmin(email) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('neurapress');
    const users = db.collection('users');
    // Find user by email
    const user = await users.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      return;
    }
    console.log(`\nFound user: ${user.name} (${user.email})`);
    console.log(`Current admin status: ${user.isAdmin ? 'Admin  ❌…' : 'Regular user âŒ'}`);
    // Update user to be admin
    await users.updateOne(
      { _id: user._id },
      { $set: { isAdmin: true } }
    );
    console.log(`\n ❌… Successfully made ${user.name} an admin!`);
    // Verify update
    const updatedUser = await users.findOne({ _id: user._id });
    console.log(`Updated admin status: ${updatedUser.isAdmin ? 'Admin  ❌…' : 'Regular user âŒ'}`);
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await client.close();
    rl.close();
  }
}
// Get email from command line arguments or prompt
const email = process.argv[2];
if (email) {
  makeAdmin(email).catch(console.error);
} else {
  rl.question('Enter the email of the user to make admin: ', (userEmail) => {
    makeAdmin(userEmail).catch(console.error);
  });
}