// Simple API test
const testAPI = async () => {
  try {
    console.log('Testing API...');
    const response = await fetch('https://buddha-po-sbackend.vercel.app/api/categories');
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('API Data:', data);
    console.log('Data length:', data.length);
    if (data.length > 0) {
      console.log('First item:', data[0]);
    }
  } catch (error) {
    console.error('API Test Error:', error);
  }
};

testAPI();