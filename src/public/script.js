let currentId = null;
let total = 0;
let queue = [];
let score = 0;

async function start() {
    try {
        let storedQueue = localStorage.getItem('queue');
        let storedScore = localStorage.getItem('score');
        let storedTotal = localStorage.getItem('total');

        if (storedQueue && storedTotal) {
            queue = JSON.parse(storedQueue);
            total = Number(storedTotal);
            score = Number(storedScore) || 0;
            currentId = queue[0]?.id || null;
            document.getElementById('word').textContent = queue[0]?.word || '';
            document.getElementById('progress').textContent = `${score}/${total}`;
        } else {
            const res = await fetch('/api/start', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            total = data.queue ? data.queue.length : data.total;
            queue = data.queue || [];
            score = 0;
            
            localStorage.setItem('total', total);
            localStorage.setItem('score', score);
            localStorage.setItem('queue', JSON.stringify(queue));
            
            if (queue.length > 0) {
                const current = queue[0];
                currentId = current.id;
                document.getElementById('word').textContent = current.word;
                document.getElementById('progress').textContent = `${score}/${total}`;
                document.getElementById('answer').value = '';
                document.getElementById('result').textContent = '';
            }
        }
    } catch (error) {
        console.error('Error starting training:', error);
    }
}

async function loadNext() {
    if (queue.length === 0) {
        showWin(score);
        return;
    }

    total = Number(localStorage.getItem('total')) || total;

    const current = queue[0];
    currentId = current.id;
    document.getElementById('word').textContent = current.word;
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('progress').textContent = `${score}/${total}`;
    localStorage.setItem('queue', JSON.stringify(queue));
}

async function check() {
    const answer = document.getElementById('answer').value;
    
    const currentWord = queue[0];
    if (!currentWord) return;
    
    const correctAnswer = currentWord.translation;

    const res = await fetch('/api/train/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: currentId, 
            answer,
            queue: queue
        })
    });

    const data = await res.json();
    score = data.score;
    queue.shift();

    localStorage.setItem('score', score);
    localStorage.setItem('queue', JSON.stringify(queue));

    total = Number(localStorage.getItem('total')) || total;

    document.getElementById('result').textContent =
        data.correct ? 'Верно' : `Неверно: ${correctAnswer}`;

    document.getElementById('progress').textContent =
        `${score}/${total}`;

    setTimeout(loadNext, 800);
}

async function addWord() {
    const word = document.getElementById('newWord').value;
    const translation = document.getElementById('newTranslation').value;

    if (!word || !translation) {
        alert('Заполните оба поля');
        return;
    }

    try {
        const res = await fetch('/api/words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, translation })
        });

        const newWord = await res.json();

        const randomIndex = Math.floor(Math.random() * (queue.length + 1));
        queue.splice(randomIndex, 0, newWord);

        const prevTotal = Number(localStorage.getItem('total')) || total || 0;
        total = prevTotal + 1;

        localStorage.setItem('queue', JSON.stringify(queue));
        localStorage.setItem('total', total);
        document.getElementById('progress').textContent = `${score}/${total}`;

        document.getElementById('newWord').value = '';
        document.getElementById('newTranslation').value = '';
    } catch (error) {
        console.error('Error adding word:', error);
        alert('Ошибка при добавлении слова');
    }
}

function showWin(score) {
    document.getElementById('trainer').style.display = 'none';
    document.getElementById('win').style.display = 'block';
    document.getElementById('finalScore').textContent =
        `Результат: ${score}/${localStorage.getItem('total')}`;
}

function restart() {
    localStorage.removeItem('queue');
    localStorage.removeItem('score');
    localStorage.removeItem('total');
    
    document.getElementById('win').style.display = 'none';
    document.getElementById('trainer').style.display = 'block';
    
    queue = [];
    score = 0;
    total = 0;
    currentId = null;
    
    start();
}

start();
