let words = [
    { id: 1, word: 'apple', translation: 'яблоко' },
    { id: 2, word: 'book', translation: 'книга' },
    { id: 3, word: 'sun', translation: 'солнце' },
    { id: 4, word: 'water', translation: 'вода' },
    { id: 5, word: 'house', translation: 'дом' },
    { id: 6, word: 'tree', translation: 'дерево' },
    { id: 7, word: 'car', translation: 'машина' },
    { id: 8, word: 'moon', translation: 'луна' }
];

let queue = [];
let score = 0;

const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
};

const startTraining = (req, res) => {
    queue = [...words];
    shuffle(queue);
    score = 0;

    res.json({ total: queue.length });
};

const getNext = (req, res) => {
    if (queue.length === 0) {
        return res.json({ finished: true, score });
    }

    const { id, word } = queue[0];
    res.json({ id, word });
};



const getAll = (req, res) => {
    const { search } = req.query;

    if (search) {
        const filtered = words.filter(w =>
            w.word.includes(search)
        );
        return res.json(filtered);
    }

    res.json(words);
};

const getById = (req, res) => {
    const id = Number(req.params.id);
    const word = words.find(w => w.id === id);

    if (!word) {
        return res.status(404).json({ error: 'Not found' });
    }

    res.json(word);
};

const create = (req, res) => {
    const { word, translation } = req.body;

    if (!word || !translation) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const newWord = {
        id: Date.now(),
        word,
        translation
    };

    words.push(newWord);
    res.status(201).json(newWord);
};


const update = (req, res) => {
    const id = Number(req.params.id);
    const { word, translation } = req.body;

    const index = words.findIndex(w => w.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Not found' });
    }

    if (word !== undefined) words[index].word = word;
    if (translation !== undefined) words[index].translation = translation;

    res.json(words[index]);
};

const remove = (req, res) => {
    const id = Number(req.params.id);
    const index = words.findIndex(w => w.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Not found' });
    }

    const deleted = words.splice(index, 1);
    res.json(deleted[0]);
};


const getRandom = (req, res) => {
    if (words.length === 0) {
        return res.status(400).json({ error: 'No words' });
    }

    const index = Math.floor(Math.random() * words.length);
    const { id, word } = words[index];

    res.json({ id, word });
};

const checkAnswer = (req, res) => {
    const { id, answer } = req.body;
    const current = queue[0];

    if (!current || current.id !== id) {
        return res.status(400).json({ error: 'Invalid state' });
    }

    const correct =
        current.translation.toLowerCase() === answer.toLowerCase();

    if (correct) score++;

    queue.shift();

    res.json({
        correct,
        rightAnswer: current.translation,
        score,
        left: queue.length
    });
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    startTraining,
    getNext,
    getRandom,
    checkAnswer
};
