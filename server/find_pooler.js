const { Client } = require('pg');
const regions = ['eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-southeast-1', 'ap-southeast-2', 'ap-south-1', 'ap-northeast-1', 'sa-east-1', 'ca-central-1'];
const ref = 'ezcvpwwueqkqfnjtwyra';
const pw = 'StOk9y7L22wdQMwE';

async function test() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${ref}:${pw}@${host}:6543/postgres`;
    console.log('Trying', host);
    const client = new Client({ connectionString, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log('SUCCESS:', connectionString);
      await client.end();
      process.exit(0);
    } catch (err) {
      console.log('Failed', err.message);
    }
  }
  console.log('All failed');
}
test();
