    <script>
        const selectScreen = document.getElementById('selectScreen');
        const gameScreen = document.getElementById('gameScreen');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const startButton = document.getElementById('startButton');
        const restartButton = document.getElementById('restartButton');
        const characterOptions = document.querySelectorAll('.character-option');
        const characterDisplay = document.getElementById('character');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const livesDisplay = document.getElementById('livesDisplay');
        const finalScoreDisplay = document.getElementById('finalScore');
        const gameContainer = document.getElementById('gameContainer');

        let selectedCharacter = null;
        let score = 0;
        let lives = 3;
        let gameActive = false;
        let characterX = 50; // percentage
        const characterSpeed = 5; // pixels per frame
        const starSpeed = 2; // pixels per frame
        const starSize = 20;
        let stars = [];
        let animationFrameId = null;
        let lastStarSpawn = 0;
        const starSpawnInterval = 1500; // ms

        // Character selection
        characterOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Deselect all
                characterOptions.forEach(opt => opt.classList.remove('selected'));
                // Select this
                option.classList.add('selected');
                selectedCharacter = {
                    name: option.dataset.name,
                    color: option.dataset.color
                };
                startButton.disabled = false;
            });
        });

        // Start game
        startButton.addEventListener('click', () => {
            if (!selectedCharacter) return;
            initGame();
            selectScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
        });

        // Restart game
        restartButton.addEventListener('click', () => {
            gameOverScreen.classList.remove('show');
            selectScreen.classList.remove('hidden');
            gameScreen.classList.add('hidden');
            // Reset UI
            characterOptions.forEach(opt => opt.classList.remove('selected'));
            startButton.disabled = true;
            selectedCharacter = null;
        });

        function initGame() {
            score = 0;
            lives = 3;
            characterX = 50;
            updateUI();
            // Set character appearance
            characterDisplay.style.backgroundColor = selectedCharacter.color;
            characterDisplay.style.borderColor = selectedCharacter.color;
            characterDisplay.textContent = getCharacterIcon(selectedCharacter.name);
            // Clear stars
            stars.forEach(star => star.element.remove());
            stars = [];
            lastStarSpawn = performance.now();
            gameActive = true;
            gameLoop();
        }

        function getCharacterIcon(name) {
            switch(name) {
                case 'Explorer': return '🧭';
                case 'Scout': return '🔭';
                case 'Pilot': return '✈️';
                default: return '👤';
            }
        }

        function updateUI() {
            scoreDisplay.textContent = `Score: ${score}`;
            livesDisplay.textContent = `Lives: ${lives}`;
            finalScoreDisplay.textContent = `Final Score: ${score}`;
        }

        function gameLoop(timestamp) {
            if (!gameActive) return;

            // Spawn stars
            if (timestamp - lastStarSpawn > starSpawnInterval) {
                spawnStar();
                lastStarSpawn = timestamp;
            }

            // Update stars
            updateStars(timestamp);

            // Request next frame
            animationFrameId = requestAnimationFrame(gameLoop);
        }

        function spawnStar() {
            const star = document.createElement('div');
            star.className = 'star';
            // Random x position within container, ensuring star fully visible
            const x = Math.random() * (gameContainer.clientWidth - starSize);
            star.style.left = `${x}px`;
            star.style.top = `-${starSize}px`;
            gameContainer.appendChild(star);
            stars.push({
                element: star,
                x: x,
                y: -starSize
            });
        }

        function updateStars(timestamp) {
            stars.forEach((star, index) => {
                // Move star down
                star.y += starSpeed;
                star.element.style.top = `${star.y}px`;

                // Check if star is caught (reached character zone)
                const characterBottom = gameContainer.clientHeight - 80; // approx bottom of character
                if (star.y > characterBottom) {
                    // Check horizontal overlap
                    const characterLeft = gameContainer.clientWidth * (characterX/100) - 40; // half width
                    const characterRight = characterLeft + 80;
                    const starLeft = star.x;
                    const starRight = star.x + starSize;

                    if (starRight > characterLeft && starLeft < characterRight) {
                        // Caught!
                        score++;
                        updateUI();
                    } else {
                        // Missed
                        lives--;
                        updateUI();
                        if (lives <= 0) {
                            endGame();
                        }
                    }
                    // Remove star
                    star.element.remove();
                    stars.splice(index, 1);
                }

                // Remove if off screen bottom (should be caught above, but safety)
                if (star.y > gameContainer.clientHeight) {
                    star.element.remove();
                    stars.splice(index, 1);
                }
            });
        }

        function endGame() {
            gameActive = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            gameScreen.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            updateUI();
        }

        // Keyboard controls for character movement
        document.addEventListener('keydown', (e) => {
            if (!gameActive) return;
            const containerWidth = gameContainer.clientWidth;
            const maxX = 100 - (80 / containerWidth * 100); // ensure character stays within bounds
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                characterX = Math.max(0, characterX - (characterSpeed / containerWidth * 100));
                characterDisplay.style.left = `${characterX}%`;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                characterX = Math.min(maxX, characterX + (characterSpeed / containerWidth * 100));
                characterDisplay.style.left = `${characterX}%`;
            }
        });

        // Optional touch controls (left/right halves)
        let touchStartX = 0;
        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        gameContainer.addEventListener('touchend', (e) => {
            if (!gameActive) return;
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchEndX - touchStartX;
            const containerWidth = gameContainer.clientWidth;
            if (Math.abs(diff) > 30) {
                if (diff < 0) {
                    // swipe left
                    characterX = Math.max(0, characterX - (characterSpeed / containerWidth * 100));
                } else {
                    // swipe right
                    const maxX = 100 - (80 / containerWidth * 100);
                    characterX = Math.min(maxX, characterX + (characterSpeed / containerWidth * 100));
                }
                characterDisplay.style.left = `${characterX}%`;
            }
        }, { passive: true });

        // Initialize on load (show select screen)
        window.addEventListener('load', () => {
            selectScreen.classList.remove('hidden');
        });
    </script>
