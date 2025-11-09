const express = require('express');
const app = express();
app.get('/api/message', (req, res) => res.json({ message: 'Hello from API!' }));
app.listen(5000, () => console.log('API running on port 5000'));
