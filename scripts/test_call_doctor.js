// Test script to POST to local /api/call-doctor
(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/call-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: -20.078003, lng: 57.61123541244636, name: 'Test User', phone: '+23057808272' })
    })
    console.log('HTTP', res.status)
    const text = await res.text()
    try {
      console.log('Response JSON:', JSON.parse(text))
    } catch (e) {
      console.log('Response text:', text)
    }
  } catch (err) {
    console.error('Request failed:', err)
    process.exit(2)
  }
})();
