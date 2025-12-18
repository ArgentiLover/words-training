const express = require('express');
const path = require('path');

const logger = require('./middleware/logger');
const wordsRoutes = require('./routes/words.routes');
const trainRoutes = require('./routes/train.routes');

const app = express();
const PORT = 3000;

app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/words', wordsRoutes);
app.use('/api/train', trainRoutes);

const controller = require('./controllers/words.controller');
app.post('/api/start', controller.startTraining);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
