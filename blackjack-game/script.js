// Game state variables
let deck = [];
let playerHand = [];
let dealerHand = [];
let computerPlayers = []; // Array to store computer players
let numComputerPlayers = 2; // Default number of computer players
let playerScore = 0;
let dealerScore = 0;
let gameOver = false;
let playerWins = 0;
let playerLosses = 0;
let playerDraws = 0;

// Sound manager
const soundManager = {
    sounds: {
        click: new Audio('sounds/click sound effect.mp3'),
        draw: new Audio('sounds/Draw sound effect.mp3'),
        cardDraw: new Audio('sounds/drawing playing card.mp3'),
        flip: new Audio('sounds/flip card sound effect.mp3'),
        win: new Audio('sounds/Winning Sound Effect.mp3'),
        loss: new Audio('sounds/Loss Sound Effect.mp3')
    },
    
    // Sound state
    muted: false,
    
    // Toggle mute state
    toggleMute: function() {
        this.muted = !this.muted;
        return this.muted;
    },
    
    // Stop all sounds
    stopAllSounds: function() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    },
    
    // Play a sound
    play: function(soundName) {
        if (this.sounds[soundName] && !this.muted) {
            // Stop all currently playing sounds
            this.stopAllSounds();
            
            // Play the requested sound
            this.sounds[soundName].play().catch(error => {
                console.log(`Error playing sound: ${error}`);
            });
        }
    }
};

// DOM elements
const dealButton = document.getElementById('deal-button');
const resetButton = document.getElementById('reset-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const soundButton = document.getElementById('sound-button');
const playerCardsElement = document.getElementById('player-cards');
const dealerCardsElement = document.getElementById('dealer-cards');
const playerScoreElement = document.getElementById('player-score');
const dealerScoreElement = document.getElementById('dealer-score');
const messageElement = document.getElementById('message');
const winsElement = document.getElementById('wins');
const lossesElement = document.getElementById('losses');
const drawsElement = document.getElementById('draws');
let computerPlayersContainer = document.getElementById('computer-players-container');
const computerPlayersSelect = document.getElementById('computer-players');

// Card values and suits
const suits = ['♥', '♦', '♠', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Add click sound to buttons
    dealButton.addEventListener('click', () => {
        soundManager.play('click');
        startNewGame();
    });

    resetButton.addEventListener('click', () => {
        soundManager.play('click');
        resetScores();
    });

    hitButton.addEventListener('click', () => {
        soundManager.play('click');
        playerHit();
    });
    
    standButton.addEventListener('click', () => {
        soundManager.play('click');
        playerStand();
    });
    
    // Add sound toggle functionality
    soundButton.addEventListener('click', () => {
        const isMuted = soundManager.toggleMute();
        if (isMuted) {
            soundButton.textContent = '🔇 Sound Off';
        } else {
            soundButton.textContent = '🔊 Sound On';
            soundManager.play('click');
        }
    });
    
    // Initialize stats from localStorage if available
    if (localStorage.getItem('blackjackStats')) {
        const stats = JSON.parse(localStorage.getItem('blackjackStats'));
        playerWins = stats.wins;
        playerLosses = stats.losses;
        playerDraws = stats.draws;
        updateStats();
    }
    
    // Create computer players container if it doesn't exist
    if (!computerPlayersContainer) {
        createComputerPlayersContainer();
    }
    
    // Initialize computer players
    initializeComputerPlayers();
    
    // Add event listener for computer players select
    computerPlayersSelect.addEventListener('change', () => {
        soundManager.play('click');
        updateComputerPlayerCount();
    });
    
    // Preload sounds
    Object.values(soundManager.sounds).forEach(audio => {
        audio.load();
    });
});

// Update computer player count
function updateComputerPlayerCount() {
    const newCount = parseInt(computerPlayersSelect.value);
    
    // Only update if the count has changed
    if (newCount !== numComputerPlayers) {
        numComputerPlayers = newCount;
        
        // Reinitialize computer players
        initializeComputerPlayers();
        
        // If a game is in progress, restart it
        if (!dealButton.disabled) {
            // Game is not in progress, just update the UI
            messageElement.textContent = `Computer players set to ${numComputerPlayers}. Press 'Deal' to start a new game.`;
        } else {
            // Game is in progress, restart it
            startNewGame();
        }
    }
}

// Create computer players container
function createComputerPlayersContainer() {
    const gameArea = document.querySelector('.game-area');
    const playerArea = document.querySelector('.player-area');
    
    const container = document.createElement('div');
    container.id = 'computer-players-container';
    container.className = 'computer-players-container';
    
    // Insert before player area
    gameArea.insertBefore(container, playerArea);
    
    // Update the reference
    computerPlayersContainer = container;
}

// Initialize computer players
function initializeComputerPlayers() {
    computerPlayers = [];
    
    // Clear the container
    if (computerPlayersContainer) {
        computerPlayersContainer.innerHTML = '';
    }
    
    // Create computer players
    for (let i = 0; i < numComputerPlayers; i++) {
        const computerPlayer = {
            id: i + 1,
            hand: [],
            score: 0,
            element: createComputerPlayerElement(i + 1)
        };
        
        computerPlayers.push(computerPlayer);
    }
}

// Create computer player element
function createComputerPlayerElement(id) {
    const computerPlayerElement = document.createElement('div');
    computerPlayerElement.className = 'computer-player-area';
    computerPlayerElement.id = `computer-player-${id}`;
    
    const heading = document.createElement('h2');
    heading.innerHTML = `Computer ${id} <span id="computer-${id}-score" class="score">0</span>`;
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards';
    cardsContainer.id = `computer-${id}-cards`;
    
    computerPlayerElement.appendChild(heading);
    computerPlayerElement.appendChild(cardsContainer);
    
    computerPlayersContainer.appendChild(computerPlayerElement);
    
    return {
        container: computerPlayerElement,
        cardsElement: cardsContainer,
        scoreElement: document.getElementById(`computer-${id}-score`)
    };
}

// Create a new shuffled deck
function createDeck() {
    const newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ value, suit });
        }
    }
    return shuffleDeck(newDeck);
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Start a new game
function startNewGame() {
    // Reset game state
    deck = createDeck();
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;
    gameOver = false;
    
    // Reset computer players
    computerPlayers.forEach(player => {
        player.hand = [];
        player.score = 0;
        player.element.cardsElement.innerHTML = '';
    });
    
    // Clear the display
    playerCardsElement.innerHTML = '';
    dealerCardsElement.innerHTML = '';
    messageElement.textContent = '';
    
    // Deal initial cards
    // First round of cards
    playerHand.push(drawCard());
    computerPlayers.forEach(player => {
        player.hand.push(drawCard());
    });
    dealerHand.push(drawCard());
    
    // Second round of cards
    playerHand.push(drawCard());
    computerPlayers.forEach(player => {
        player.hand.push(drawCard());
    });
    dealerHand.push(drawCard(true)); // Second dealer card is face down
    
    // Update the display
    updateScores();
    
    // Enable/disable buttons
    dealButton.disabled = true;
    hitButton.disabled = false;
    standButton.disabled = false;
    
    // Check for blackjack
    if (playerScore === 21) {
        playerStand(); // Auto-stand on blackjack
    }
}

// Draw a card from the deck
function drawCard(faceDown = false) {
    if (deck.length === 0) {
        deck = createDeck(); // Reshuffle if deck is empty
    }
    const card = deck.pop();
    card.faceDown = faceDown;
    
    // Play card draw sound (unless it's a face down card)
    if (!faceDown) {
        soundManager.play('cardDraw');
    }
    
    return card;
}

// Calculate the score of a hand
function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.faceDown) continue; // Don't count face-down cards
        
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// Update scores and display
function updateScores() {
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);
    
    // Update computer player scores
    computerPlayers.forEach(player => {
        player.score = calculateScore(player.hand);
        player.element.scoreElement.textContent = player.score;
    });
    
    playerScoreElement.textContent = playerScore;
    dealerScoreElement.textContent = dealerScore;
    
    renderCards();
}

// Render cards on the screen
function renderCards() {
    playerCardsElement.innerHTML = '';
    dealerCardsElement.innerHTML = '';
    
    // Render player cards
    playerHand.forEach(card => {
        playerCardsElement.appendChild(createCardElement(card));
    });
    
    // Render dealer cards
    dealerHand.forEach(card => {
        dealerCardsElement.appendChild(createCardElement(card));
    });
    
    // Render computer player cards
    computerPlayers.forEach(player => {
        player.element.cardsElement.innerHTML = '';
        player.hand.forEach(card => {
            player.element.cardsElement.appendChild(createCardElement(card));
        });
    });
}

// Create a card element
function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    
    if (card.faceDown) {
        cardElement.classList.add('face-down');
        return cardElement;
    }
    
    // Add color class based on suit
    if (card.suit === '♥' || card.suit === '♦') {
        cardElement.classList.add('red');
    } else {
        cardElement.classList.add('black');
    }
    
    // Create card content
    const valueTop = document.createElement('div');
    valueTop.className = 'card-value';
    valueTop.textContent = card.value;
    
    const suit = document.createElement('div');
    suit.className = 'card-suit';
    suit.textContent = card.suit;
    
    const valueBottom = document.createElement('div');
    valueBottom.className = 'card-value-bottom';
    valueBottom.textContent = card.value;
    
    cardElement.appendChild(valueTop);
    cardElement.appendChild(suit);
    cardElement.appendChild(valueBottom);
    
    return cardElement;
}

// Player hits (takes another card)
function playerHit() {
    if (gameOver) return;
    
    soundManager.play('draw');
    playerHand.push(drawCard());
    updateScores();
    
    // Check if player busts
    if (playerScore > 21) {
        endGame('bust');
    }
}

// Player stands (ends their turn)
function playerStand() {
    if (gameOver) return;
    
    // Reveal dealer's face-down card
    dealerHand.forEach(card => {
        if (card.faceDown) {
            card.faceDown = false;
            soundManager.play('flip');
        }
    });
    
    // Computer players play their turns
    computerPlayersPlay();
    
    // Dealer draws until they have at least 17
    dealerPlay();
    
    // Determine the winner
    determineWinner();
}

// Computer players play their turns
function computerPlayersPlay() {
    computerPlayers.forEach(player => {
        // Basic strategy: hit until 17 or higher
        while (player.score < 17) {
            player.hand.push(drawCard());
            player.score = calculateScore(player.hand);
        }
    });
    
    updateScores();
}

// Dealer's play logic
function dealerPlay() {
    updateScores();
    
    // Dealer draws until they have at least 17
    while (dealerScore < 17) {
        dealerHand.push(drawCard());
        updateScores();
    }
}
// Reset Logic
function resetScores() {
    playerWins = 0;
    playerLosses = 0;
    playerDraws = 0;
    localStorage.setItem('blackjackStats', JSON.stringify({
        wins: playerWins,
        losses: playerLosses,
        draws: playerDraws
    }));
    updateStats();
}

// Determine the winner
function determineWinner() {
    let result;
    let winners = [];
    let message = '';
    
    // Check if player busted
    if (playerScore > 21) {
        result = 'bust';
    } else {
        // Player didn't bust, check against dealer
        if (dealerScore > 21) {
            // Dealer busted, player wins
            result = 'dealer_bust';
            winners.push('player');
            
            // Check which computer players didn't bust
            computerPlayers.forEach(player => {
                if (player.score <= 21) {
                    winners.push(`computer_${player.id}`);
                }
            });
        } else {
            // Neither player nor dealer busted, compare scores
            if (playerScore > dealerScore) {
                winners.push('player');
            } else if (playerScore < dealerScore) {
                // Player lost to dealer
            } else {
                // Player tied with dealer
                result = 'push';
            }
            
            // Check computer players against dealer
            computerPlayers.forEach(player => {
                if (player.score <= 21 && player.score > dealerScore) {
                    winners.push(`computer_${player.id}`);
                } else if (player.score === dealerScore && player.score <= 21) {
                    // Computer player tied with dealer
                }
            });
            
            // Determine final result based on winners
            if (winners.includes('player')) {
                result = 'player_win';
            } else if (winners.length > 0) {
                result = 'computer_win';
            } else if (result !== 'push') {
                result = 'dealer_win';
            }
        }
    }
    
    // Create message based on result and winners
    if (result === 'bust') {
        message = 'You bust! ';
        playerLosses++;
    } else if (result === 'dealer_bust') {
        message = 'Dealer busts! ';
        if (winners.includes('player')) {
            message += 'You win! ';
            playerWins++;
        }
    } else if (result === 'player_win') {
        message = 'You win! ';
        playerWins++;
    } else if (result === 'dealer_win') {
        message = 'Dealer wins. ';
        playerLosses++;
    } else if (result === 'push') {
        message = "It's a tie between you and the dealer! ";
        playerDraws++;
    } else if (result === 'computer_win' && !winners.includes('player')) {
        message = 'You lose. ';
        playerLosses++;
    }
    
    // Add computer winners to message
    const computerWinners = winners.filter(w => w.startsWith('computer_'));
    if (computerWinners.length > 0) {
        message += 'Computer player' + (computerWinners.length > 1 ? 's ' : ' ');
        message += computerWinners.map(w => w.split('_')[1]).join(', ') + ' won!';
    }
    
    endGame(result, message);
}

// End the game and display the result
function endGame(result, customMessage) {
    gameOver = true;
    
    // Enable/disable buttons
    dealButton.disabled = false;
    hitButton.disabled = true;
    standButton.disabled = true;
    
    // Display message based on result
    let message = customMessage || '';
    let playerArea = document.querySelector('.player-area');
    let dealerArea = document.querySelector('.dealer-area');
    
    // Remove win animations
    playerArea.classList.remove('win-animation');
    dealerArea.classList.remove('win-animation');
    computerPlayers.forEach(player => {
        player.element.container.classList.remove('win-animation');
    });
    
    // Play win/loss sound based on result
    if (result === 'player_win' || result === 'dealer_bust' || 
        (customMessage && customMessage.includes('You win'))) {
        soundManager.play('win');
    } else if (result === 'bust' || result === 'dealer_win' || 
               result === 'computer_win' || 
               (customMessage && (customMessage.includes('You bust') || 
                                 customMessage.includes('You lose')))) {
        soundManager.play('loss');
    }
    
    // Add win animations based on result
    if (!customMessage) {
        switch (result) {
            case 'bust':
                message = 'You bust! Dealer wins.';
                dealerArea.classList.add('win-animation');
                playerLosses++;
                break;
            case 'dealer_bust':
                message = 'Dealer busts! You win!';
                playerArea.classList.add('win-animation');
                playerWins++;
                break;
            case 'player_win':
                message = 'You win!';
                playerArea.classList.add('win-animation');
                playerWins++;
                break;
            case 'dealer_win':
                message = 'Dealer wins.';
                dealerArea.classList.add('win-animation');
                playerLosses++;
                break;
            case 'push':
                message = "It's a tie!";
                playerDraws++;
                break;
            case 'computer_win':
                message = 'Computer player wins!';
                // Find which computer player won and animate them
                computerPlayers.forEach(player => {
                    if (player.score <= 21 && player.score > dealerScore && player.score > playerScore) {
                        player.element.container.classList.add('win-animation');
                    }
                });
                playerLosses++;
                break;
        }
    } else {
        // Add animations based on the custom message
        if (message.includes('You win')) {
            playerArea.classList.add('win-animation');
        }
        if (message.includes('Dealer wins') || message.includes('You bust')) {
            dealerArea.classList.add('win-animation');
        }
        
        // Animate winning computer players
        computerPlayers.forEach(player => {
            if (message.includes(`Computer player ${player.id} won`)) {
                player.element.container.classList.add('win-animation');
            }
        });
    }
    
    messageElement.textContent = message;
    updateStats();
    
    // Save stats to localStorage
    localStorage.setItem('blackjackStats', JSON.stringify({
        wins: playerWins,
        losses: playerLosses,
        draws: playerDraws
    }));
}

// Update the stats display
function updateStats() {
    winsElement.textContent = playerWins;
    lossesElement.textContent = playerLosses;
    drawsElement.textContent = playerDraws;
}
