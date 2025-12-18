let currentId = null;
let total = 0;

async function start() {
    let storedQueue = localStorage.getItem('queue');
    let storedScore = localStorage.getItem('score');

    if (storedQueue) {
        queue = JSON.parse(storedQueue);
        total = localStorage.getItem('total');
        currentId = queue[0]?.id || null;
        document.getElementById('word').textContent = queue[0]?.word || '';
        document.getElementById('progress').textContent = `${storedScore}/${total}`;
        score = Number(storedScore) || 0;
    } else {
        const res = await fetch('/api/train/start', { method: 'POST' });
        const data = await res.json();
        total = data.total;
        score = 0;
        queue = [];
        localStorage.setItem('total', total);
        localStorage.setItem('score', score);
        loadNext();
    }
}

async function loadNext() {
    if (!queue.length) {
        const res = await fetch('/api/train/next');
        const data = await res.json();

        if (data.finished) {
            showWin(score);
            return;
        }

        queue = [data];
    }

    const current = queue[0];
    currentId = current.id;
    document.getElementById('word').textContent = current.word;
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
    localStorage.setItem('queue', JSON.stringify(queue));
}

async function check() {
    const answer = document.getElementById('answer').value;

    const res = await fetch('/api/train/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentId, answer })
    });

    const data = await res.json();
    score = data.score;
    queue.shift();

    localStorage.setItem('score', score);
    localStorage.setItem('queue', JSON.stringify(queue));

    document.getElementById('result').textContent =
        data.correct ? 'Верно' : `Неверно: ${data.rightAnswer}`;

    document.getElementById('progress').textContent =
        `${score}/${total}`;

    setTimeout(loadNext, 800);
}

async function addWord() {
    const word = document.getElementById('newWord').value;
    const translation = document.getElementById('newTranslation').value;

    await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, translation })
    });

    document.getElementById('newWord').value = '';
    document.getElementById('newTranslation').value = '';
}

function showWin(score) {
    document.getElementById('trainer').style.display = 'none';
    document.getElementById('win').style.display = 'block';
    document.getElementById('finalScore').textContent =
        `Результат: ${score}/${localStorage.getItem('total')}`;
}

function restart() {
    document.getElementById('win').style.display = 'none';
    document.getElementById('trainer').style.display = 'block';
    start();
}

start();
