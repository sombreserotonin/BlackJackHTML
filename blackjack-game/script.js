// Game state variables
let deck = [];
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let gameOver = false;
let playerWins = 0;
let playerLosses = 0;
let playerDraws = 0;

// DOM elements
const dealButton = document.getElementById('deal-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const playerCardsElement = document.getElementById('player-cards');
const dealerCardsElement = document.getElementById('dealer-cards');
const playerScoreElement = document.getElementById('player-score');
const dealerScoreElement = document.getElementById('dealer-score');
const messageElement = document.getElementById('message');
const winsElement = document.getElementById('wins');
const lossesElement = document.getElementById('losses');
const drawsElement = document.getElementById('draws');

// Card values and suits
const suits = ['♥', '♦', '♠', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    dealButton.addEventListener('click', startNewGame);
    hitButton.addEventListener('click', playerHit);
    standButton.addEventListener('click', playerStand);
    
    // Initialize stats from localStorage if available
    if (localStorage.getItem('blackjackStats')) {
        const stats = JSON.parse(localStorage.getItem('blackjackStats'));
        playerWins = stats.wins;
        playerLosses = stats.losses;
        playerDraws = stats.draws;
        updateStats();
    }
});

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
    
    // Clear the display
    playerCardsElement.innerHTML = '';
    dealerCardsElement.innerHTML = '';
    messageElement.textContent = '';
    
    // Deal initial cards
    playerHand.push(drawCard());
    dealerHand.push(drawCard());
    playerHand.push(drawCard());
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
    
    playerScoreElement.textContent = playerScore;
    dealerScoreElement.textContent = dealerScore;
    
    renderCards();
}

// Render cards on the screen
function renderCards() {
    playerCardsElement.innerHTML = '';
    dealerCardsElement.innerHTML = '';
    
    playerHand.forEach(card => {
        playerCardsElement.appendChild(createCardElement(card));
    });
    
    dealerHand.forEach(card => {
        dealerCardsElement.appendChild(createCardElement(card));
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
    dealerHand.forEach(card => card.faceDown = false);
    
    // Dealer draws until they have at least 17
    dealerPlay();
    
    // Determine the winner
    determineWinner();
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

// Determine the winner
function determineWinner() {
    let result;
    
    if (playerScore > 21) {
        result = 'bust';
    } else if (dealerScore > 21) {
        result = 'dealer_bust';
    } else if (playerScore > dealerScore) {
        result = 'player_win';
    } else if (playerScore < dealerScore) {
        result = 'dealer_win';
    } else {
        result = 'push';
    }
    
    endGame(result);
}

// End the game and display the result
function endGame(result) {
    gameOver = true;
    
    // Enable/disable buttons
    dealButton.disabled = false;
    hitButton.disabled = true;
    standButton.disabled = true;
    
    // Display message based on result
    let message = '';
    let playerArea = document.querySelector('.player-area');
    let dealerArea = document.querySelector('.dealer-area');
    
    playerArea.classList.remove('win-animation');
    dealerArea.classList.remove('win-animation');
    
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
