import pg from 'pg';
const { Pool } = pg;

const rawPassword = 'r?p6g2qXY*$nFHB';
const encodedPassword = encodeURIComponent(rawPassword);
const projectRef = 'vutznbwzsfcqyvqssver';

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'sa-east-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-north-1',
  'ap-south-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1'
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.${projectRef}:${encodedPassword}@${host}:6543/postgres`;
  
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`✅ SUCCESS for region ${region}! Time:`, res.rows[0].now);
    return true;
  } catch (err) {
    console.log(`❌ Failed for region ${region} (${host}):`, err.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function run() {
  console.log(`Testing all regions for project ref: ${projectRef}...`);
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      console.log(`\n🎉 Found matching region: ${region}`);
      break;
    }
  }
}

run();
