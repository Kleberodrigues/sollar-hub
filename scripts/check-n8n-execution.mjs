const N8N_API_URL = 'https://sollar-n8n.7wxwzr.easypanel.host/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NmIzOTJhNC0yYzA4LTRhZDEtYmZjOS1jOWViODU4YjkwNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1NDgyMTU1fQ.vu_dpD-6UdjYgW4enAkB--ep7PPLBkPX0A6c1qix7ZQ';

async function main() {
  const executionId = process.argv[2] || '21';

  const response = await fetch(`${N8N_API_URL}/executions/${executionId}?includeData=true`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });

  const data = await response.json();

  console.log('Status:', data.status);
  console.log('Started:', data.startedAt);
  console.log('Stopped:', data.stoppedAt);

  if (data.data?.resultData?.error) {
    console.log('\n❌ Error:', JSON.stringify(data.data.resultData.error, null, 2));
  }

  if (data.data?.resultData?.runData) {
    console.log('\n📊 Run Data:');
    for (const [nodeName, nodeData] of Object.entries(data.data.resultData.runData)) {
      const lastRun = nodeData[nodeData.length - 1];
      console.log(`  ${nodeName}: ${lastRun?.error ? '❌ ' + lastRun.error.message : '✅ OK'}`);
    }
  }
}

main().catch(console.error);
