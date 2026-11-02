const express = require('express');

const app = express();
const PORT = 5001;

app.get('/', (req, res) => {
    res.send('TEST SERVER IS WORKING');
});

app.get('/api/test-route', (req, res) => {
    res.send('EXPRESS ROUTING IS WORKING');
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Test server running at http://127.0.0.1:${PORT}`);
});