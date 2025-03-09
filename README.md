## Project Overview

A simple, interactive blackjack card game built with **HTML**, **CSS**, and **JavaScript**. This project is **a refined version of a university assessment**, enhanced with additional features and improvements. The game allows you to practice your blackjack skills and keeps track of basic statistics (wins, losses, and draws) using the browser’s local storage.

### Features

- **Realistic Blackjack Mechanics**  
  Players can hit, stand, and experience dealer draws until the dealer reaches at least 17. The Ace can act as 1 or 11.

- **Dealer/Player Score Tracking**  
  Scores are automatically updated and displayed for both the player and the dealer.

- **Win/Loss/Draw Statistics**  
  The game keeps a tally of wins, losses, and draws locally, so your stats persist between sessions (in the same browser).

- **Interactive UI**  
  A clean visual presentation, with card flipping, hover animations, and simple transitions.

---

## How to Run

1. **Clone or Download** the files from this README (the HTML, CSS, and JS).
2. **Open** the `index.html` file in any modern web browser (Chrome, Firefox, Edge, etc.).
3. **Start Playing**:
    - Click the **Deal** button to start a new round.
    - Click **Hit** to draw another card.
    - Click **Stand** to let the dealer draw until they have 17 or more.
    - Observe the result of the round and continue playing!

No server setup is required; simply double-clicking or opening the `index.html` file in your browser should work. However, some browsers or security policies may require you to serve the files via a local server for local storage to function properly. In most cases, it will work by opening the HTML file directly.

---

## File Structure

- **index.html**  
- **styles.css**  
- **script.js**

### `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blackjack Game</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1>Blackjack</h1>
        
        <div class="game-area">
            <div class="dealer-area">
                <h2>Dealer's Hand <span id="dealer-score" class="score">0</span></h2>
                <div id="dealer-cards" class="cards"></div>
            </div>
            
            <div class="player-area">
                <h2>Your Hand <span id="player-score" class="score">0</span></h2>
                <div id="player-cards" class="cards"></div>
            </div>
            
            <div class="message-area">
                <div id="message">Press 'Deal' to start a new game</div>
            </div>
            
            <div class="controls">
                <button id="deal-button">Deal</button>
                <button id="hit-button" disabled>Hit</button>
                <button id="stand-button" disabled>Stand</button>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <span>Wins:</span>
                    <span id="wins">0</span>
                </div>
                <div class="stat">
                    <span>Losses:</span>
                    <span id="losses">0</span>
                </div>
                <div class="stat">
                    <span>Draws:</span>
                    <span id="draws">0</span>
                </div>
            </div>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
