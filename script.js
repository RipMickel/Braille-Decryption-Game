const grid = document.getElementById('grid');
const targetDisplay = document.getElementById('targetSymbol');
const timerFill = document.getElementById('timerFill');
const streakDisplay = document.getElementById('streakDisplay');
const gameOverScreen = document.getElementById('gameOverScreen');
const playAgainBtn = document.getElementById('playAgainBtn');
const encryptedBox = document.getElementById('encryptedBox');

const brailleSymbols = [];
for (let i = 0x2800; i <= 0x28FF; i++) {
    brailleSymbols.push(String.fromCharCode(i));
}

let realIndex, targetSymbol, timer, timeLeft;
let correctClicks = 0;
const totalRequired = 3;
let roundCounter = 0;
let streak = 0;
let gameActive = true;

startGame();

function startGame() {
    gameActive = true;
    roundCounter++;
    grid.innerHTML = "";
    correctClicks = 0;
    timeLeft = 10;

    encryptedBox.style.display = 'none';

    targetSymbol = brailleSymbols[Math.floor(Math.random() * brailleSymbols.length)];
    targetDisplay.textContent = targetSymbol;
    targetDisplay.classList.remove('encrypted-text');

    generateGrid();
    startTimer();
    startRandomShuffle();
}

function generateGrid() {
    const totalCells = 100; // 10x10 grid
    realIndex = Math.floor(Math.random() * totalCells);

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const symbolSpan = document.createElement('span');
        symbolSpan.classList.add('symbol');
        symbolSpan.textContent = brailleSymbols[Math.floor(Math.random() * brailleSymbols.length)];

        cell.appendChild(symbolSpan);

        if (i === realIndex) {
            symbolSpan.textContent = targetSymbol;
            cell.dataset.real = "true";
        }

        cell.dataset.round = roundCounter;
        grid.appendChild(cell);

        cell.addEventListener('click', () => handleClick(cell));
    }
}

function handleClick(cell) {
    if (!gameActive) return;

    const symbolSpan = cell.querySelector('.symbol');
    const cellSymbol = symbolSpan.textContent;

    if (cell.dataset.real === "true" && cellSymbol === targetSymbol) {
        correctClicks++;
        timeLeft = 10;

        if (correctClicks >= totalRequired) {
            clearInterval(timer);
            streak++;

            // Show encrypted overlay instead of target display
            encryptedBox.style.display = 'block';

            setTimeout(() => {
                streakDisplay.textContent = `Streak: ${streak}`;
                startGame();
            }, 2000);
        } else {
            cell.removeAttribute('data-real');
            symbolSpan.textContent = brailleSymbols[Math.floor(Math.random() * brailleSymbols.length)];
            placeTargetSymbol();
        }
    } else {
        cell.style.background = "#e50914";
        setTimeout(() => {
            cell.style.background = "#000";
        }, 500);
    }
}

function placeTargetSymbol() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => delete cell.dataset.real);

    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * cells.length);
    } while (cells[newIndex].dataset.real === "true");

    realIndex = newIndex;
    const targetCell = cells[realIndex];
    const symbolSpan = targetCell.querySelector('.symbol');

    symbolSpan.textContent = targetSymbol;
    symbolSpan.style.opacity = '1';
    targetCell.dataset.real = "true";
    targetCell.dataset.round = roundCounter;
}

function startRandomShuffle() {
    const cells = document.querySelectorAll('.cell');

    cells.forEach(cell => {
        const symbolSpan = cell.querySelector('.symbol');

        function shuffleLoop() {
            if (!gameActive || parseInt(cell.dataset.round) !== roundCounter) return;

            if (cell.dataset.real === "true") {
                if (symbolSpan.textContent !== targetSymbol) {
                    symbolSpan.textContent = targetSymbol;
                }
                symbolSpan.style.opacity = '1';
                setTimeout(shuffleLoop, 1000);
                return;
            }

            symbolSpan.style.transition = 'opacity 0.4s ease';
            symbolSpan.style.opacity = '0';

            setTimeout(() => {
                if (!gameActive || parseInt(cell.dataset.round) !== roundCounter || cell.dataset.real === "true") return;

                symbolSpan.textContent = brailleSymbols[Math.floor(Math.random() * brailleSymbols.length)];
                symbolSpan.style.opacity = '1';

                const nextDelay = Math.random() * 2000 + 1000;
                setTimeout(shuffleLoop, nextDelay);
            }, 400);
        }

        shuffleLoop();
    });
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 10;

    timer = setInterval(() => {
        if (!gameActive) return;

        timeLeft -= 0.1;
        timerFill.style.width = `${(timeLeft / 10) * 100}%`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            showGameOver();
        }
    }, 100);
}

function showGameOver() {
    gameActive = false;
    gameOverScreen.style.display = 'block';
}

playAgainBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    streak = 0;
    streakDisplay.textContent = `Streak: ${streak}`;
    startGame();
});