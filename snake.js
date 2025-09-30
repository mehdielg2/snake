const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const playBtn = document.getElementById('playBtn');
const menu = document.getElementById('menu');
const game = document.getElementById('game');

// Constantes
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;

// Niveaux de difficulté
const LEVELS = {
    facile: { speed: 200, acceleration: 3, name: "Facile" },
    moyen: { speed: 150, acceleration: 5, name: "Moyen" },
    difficile: { speed: 100, acceleration: 8, name: "Difficile" }
};

// Serpent
let snake = [];
let direction = {x: 0, y: 0};
let food = {x: 0, y: 0};
let score = 0;
let gameSpeed = 150;
let gameInterval;
let gameOver = false;
let animationFrame = 0;
let isPaused = false;
let currentLevel = 'moyen';

// Quand on clique sur JOUER
playBtn.addEventListener('click', startGame);

function startGame() {
    console.log("Démarrage du jeu...");
    menu.classList.add('hidden');
    game.classList.remove('hidden');
    
    resetGame();
}

function resetGame() {
    // Réinitialiser le jeu
    snake = [{x: 10, y: 10}];
    direction = {x: 1, y: 0}; // Commence à droite
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = LEVELS[currentLevel].speed;
    gameOver = false;
    animationFrame = 0;
    isPaused = false;
    
    generateFood();
    startGameLoop();
}

function startGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    if (gameOver || isPaused) return;
    
    update();
    draw();
}

function update() {
    // Déplacer le serpent
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Game over si collision avec les murs
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        showGameOver();
        return;
    }
    
    // Game over si collision avec soi-même
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            showGameOver();
            return;
        }
    }
    
    // Ajouter la nouvelle tête
    snake.unshift(head);
    
    // Manger la nourriture
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        generateFood();
        
        // Accélérer le jeu selon le niveau
        const acceleration = LEVELS[currentLevel].acceleration;
        const minSpeed = LEVELS[currentLevel].speed / 2;
        if (score % 3 === 0 && gameSpeed > minSpeed) {
            gameSpeed -= acceleration;
            startGameLoop();
        }
    } else {
        // Retirer la queue si pas mangé
        snake.pop();
    }
}

function draw() {
    drawGame();
    
    // Afficher "PAUSE" si le jeu est en pause
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'yellow';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Appuie sur Échap pour continuer', canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(`Niveau: ${LEVELS[currentLevel].name}`, canvas.width / 2, canvas.height / 2 + 50);
    }
}

function drawGame() {
    // Fond noir
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Nourriture (rouge)
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // Serpent (couleur selon le niveau)
    let snakeColor;
    switch(currentLevel) {
        case 'facile': snakeColor = 'lime'; break;
        case 'moyen': snakeColor = 'cyan'; break;
        case 'difficile': snakeColor = 'orange'; break;
    }
    
    ctx.fillStyle = snakeColor;
    for (let segment of snake) {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
    
    // Grille
    ctx.strokeStyle = '#333';
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    }
    
    // Afficher le niveau en haut
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Niveau: ${LEVELS[currentLevel].name}`, 10, 20);
}

function generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
        
        // Vérifier que la nourriture n'est pas sur le serpent
        for (let segment of snake) {
            if (newFood.x === segment.x && newFood.y === segment.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

function showGameOver() {
    gameOver = true;
    clearInterval(gameInterval);
    
    // Animation Game Over
    function animateGameOver() {
        animationFrame++;
        
        // Dessiner le jeu normal
        drawGame();
        
        // Overlay sombre qui pulse
        ctx.fillStyle = `rgba(0, 0, 0, ${0.5 + Math.sin(animationFrame * 0.2) * 0.2})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Texte Game Over qui pulse
        const scale = 1 + Math.sin(animationFrame * 0.1) * 0.1;
        
        ctx.fillStyle = 'red';
        ctx.font = `${30 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Niveau: ${LEVELS[currentLevel].name}`, canvas.width / 2, canvas.height / 2 + 25);
        ctx.fillText('Appuie sur une flèche pour rejouer', canvas.width / 2, canvas.height / 2 + 55);
        
        if (!gameOver) return;
        requestAnimationFrame(animateGameOver);
    }
    
    animateGameOver();
}

function togglePause() {
    if (gameOver) return;
    
    isPaused = !isPaused;
    if (!isPaused) {
        draw(); // Redessiner pour enlever l'écran de pause
    }
}

function changeLevel(level) {
    currentLevel = level;
    if (!gameOver && !isPaused) {
        resetGame();
    }
}

// Contrôles clavier
document.addEventListener('keydown', (e) => {
    // Empêcher le défilement de la page avec les flèches
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'Escape':
            togglePause();
            break;
            
        case '1':
            changeLevel('facile');
            break;
            
        case '2':
            changeLevel('moyen');
            break;
            
        case '3':
            changeLevel('difficile');
            break;
            
        case 'ArrowUp':
            if (direction.y === 0 && !isPaused) {
                direction = {x: 0, y: -1};
            }
            break;
            
        case 'ArrowDown':
            if (direction.y === 0 && !isPaused) {
                direction = {x: 0, y: 1};
            }
            break;
            
        case 'ArrowLeft':
            if (direction.x === 0 && !isPaused) {
                direction = {x: -1, y: 0};
            }
            break;
            
        case 'ArrowRight':
            if (direction.x === 0 && !isPaused) {
                direction = {x: 1, y: 0};
            }
            break;
    }
    
    // Si game over, relancer avec n'importe quelle flèche
    if (gameOver && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        resetGame();
        return;
    }
});

