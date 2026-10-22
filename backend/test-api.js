async function main() {
  const loginRes = await fetch('http://localhost:4000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@zidcod.com', password: 'admin123' })
  });
  const { accessToken } = await loginRes.json();
  
  const pRes = await fetch('http://localhost:4000/products', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const products = await pRes.json();
  console.log(`Fetched ${products.length} products via API`);
}
main().catch(console.error);
