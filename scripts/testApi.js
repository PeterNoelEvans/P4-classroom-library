const axios = require('axios');

const API_URL = 'http://localhost:4000/api';
let authToken = '';

const testApi = async () => {
    try {
        // Test 1: Login
        console.log('\nTesting Login...');
        const loginData = {
            fullName: 'Kankanit Korsesthakarn',
            class: '4/1',
            password: 'password123'
        };
        console.log('Attempting login with:', loginData);
        
        const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
        authToken = loginResponse.data.token;
        console.log('Login successful:', loginResponse.data.nickname);

        // Test 2: Get Available Books
        console.log('\nTesting Get Available Books...');
        const booksResponse = await axios.get(`${API_URL}/books`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Available books:', booksResponse.data.length);

        // Test 3: Borrow a Book
        if (booksResponse.data.length > 0) {
            console.log('\nTesting Borrow Book...');
            const bookId = booksResponse.data[0]._id;
            const borrowResponse = await axios.post(
                `${API_URL}/books/borrow/${bookId}`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            console.log('Book borrowed:', borrowResponse.data.title);
        }

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Full error response:', error.response.data);
        }
    }
};

testApi(); 