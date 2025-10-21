// Game state
let gameState = {
  player: {
    name: "Rushi",
    chips: 145,
    bet: 0,
  },
  dealer: {
    cards: [],
    sum: 0,
    hiddenCard: null,
  },
  playerHand: {
    cards: [],
    sum: 0,
  },
  isGameActive: false,
  isPlayerTurn: false,
  hasBlackjack: false,
  isBusted: false,
};

// DOM elements
const messageEl = document.getElementById("message-el");
const playerChipsEl = document.getElementById("chips-value");
const currentBetEl = document.getElementById("current-bet-value");
const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerSumEl = document.getElementById("dealer-sum");
const playerSumEl = document.getElementById("player-sum");

// Buttons
const startBtn = document.getElementById("start-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const doubleBtn = document.getElementById("double-btn");
const newGameBtn = document.getElementById("new-game-btn");
const betButtons = document.querySelectorAll(".bet-btn");

// Card suits and values
const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

// Initialize game
function initGame() {
  updateDisplay();
  addEventListeners();
}

// Add event listeners
function addEventListeners() {
  startBtn.addEventListener("click", startGame);
  hitBtn.addEventListener("click", hit);
  standBtn.addEventListener("click", stand);
  doubleBtn.addEventListener("click", doubleDown);
  newGameBtn.addEventListener("click", resetGame);

  betButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      placeBet(parseInt(this.dataset.bet));
    });
  });
}

// Place a bet
function placeBet(amount) {
  if (gameState.isGameActive) return;

  if (amount <= gameState.player.chips) {
    gameState.player.bet = amount;
    updateDisplay();

    // Highlight selected bet button
    betButtons.forEach((btn) => {
      if (parseInt(btn.dataset.bet) === amount) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    messageEl.textContent = `Bet placed: ₹${amount}. Ready to deal!`;
  } else {
    messageEl.textContent = "Not enough chips for that bet!";
  }
}

// Start the game
function startGame() {
  if (gameState.player.bet === 0) {
    messageEl.textContent = "Please place a bet first!";
    return;
  }

  if (gameState.isGameActive) return;

  // Reset game state
  gameState.isGameActive = true;
  gameState.isPlayerTurn = true;
  gameState.hasBlackjack = false;
  gameState.isBusted = false;
  gameState.playerHand.cards = [];
  gameState.dealer.cards = [];
  gameState.playerHand.sum = 0;
  gameState.dealer.sum = 0;

  // Deal initial cards
  dealCard(gameState.playerHand);
  dealCard(gameState.dealer, true); // Dealer's first card is hidden
  dealCard(gameState.playerHand);
  dealCard(gameState.dealer);

  // Update UI
  updateDisplay();
  updateButtons();

  // Check for blackjack
  if (gameState.playerHand.sum === 21) {
    gameState.hasBlackjack = true;
    endGame("Blackjack! You win 1.5x your bet!");
    gameState.player.chips += Math.floor(gameState.player.bet * 1.5);
  }
}

// Deal a card
function dealCard(hand, isHidden = false) {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  const card = { suit, value, isHidden };

  hand.cards.push(card);
  updateHandSum(hand);

  return card;
}

// Calculate hand sum
function updateHandSum(hand) {
  hand.sum = 0;
  let aceCount = 0;

  for (let card of hand.cards) {
    if (card.value === "A") {
      hand.sum += 11;
      aceCount++;
    } else if (["K", "Q", "J"].includes(card.value)) {
      hand.sum += 10;
    } else {
      hand.sum += parseInt(card.value);
    }
  }

  // Adjust for aces
  while (hand.sum > 21 && aceCount > 0) {
    hand.sum -= 10;
    aceCount--;
  }
}

// Player hits
function hit() {
  if (!gameState.isPlayerTurn || !gameState.isGameActive) return;

  dealCard(gameState.playerHand);
  updateDisplay();

  if (gameState.playerHand.sum > 21) {
    gameState.isBusted = true;
    endGame("Bust! You went over 21.");
  } else if (gameState.playerHand.sum === 21) {
    stand();
  }

  updateButtons();
}

// Player stands
function stand() {
  if (!gameState.isPlayerTurn || !gameState.isGameActive) return;

  gameState.isPlayerTurn = false;
  dealerPlay();
}

// Player doubles down
function doubleDown() {
  if (
    !gameState.isPlayerTurn ||
    !gameState.isGameActive ||
    gameState.playerHand.cards.length !== 2
  )
    return;

  if (gameState.player.bet * 2 <= gameState.player.chips) {
    gameState.player.bet *= 2;
    hit();

    if (!gameState.isBusted) {
      stand();
    }
  } else {
    messageEl.textContent = "Not enough chips to double down!";
  }
}

// Dealer's turn
function dealerPlay() {
  // Reveal dealer's hidden card
  gameState.dealer.cards[0].isHidden = false;
  updateHandSum(gameState.dealer);
  updateDisplay();

  // Dealer draws until 17 or higher
  const dealerDrawInterval = setInterval(() => {
    if (gameState.dealer.sum < 17) {
      dealCard(gameState.dealer);
      updateDisplay();
    } else {
      clearInterval(dealerDrawInterval);
      determineWinner();
    }
  }, 1000);
}

// Determine winner
function determineWinner() {
  let message = "";

  if (gameState.isBusted) {
    message = "You busted! Dealer wins.";
    gameState.player.chips -= gameState.player.bet;
  } else if (gameState.dealer.sum > 21) {
    message = "Dealer busted! You win!";
    gameState.player.chips += gameState.player.bet;
  } else if (gameState.playerHand.sum > gameState.dealer.sum) {
    message = "You win!";
    gameState.player.chips += gameState.player.bet;
  } else if (gameState.playerHand.sum < gameState.dealer.sum) {
    message = "Dealer wins!";
    gameState.player.chips -= gameState.player.bet;
  } else {
    message = "It's a push! Bet returned.";
    // No change to chips
  }

  endGame(message);
}

// End the game
function endGame(message) {
  gameState.isGameActive = false;
  gameState.isPlayerTurn = false;

  // Reveal all dealer cards
  gameState.dealer.cards.forEach((card) => (card.isHidden = false));
  updateHandSum(gameState.dealer);

  updateDisplay();
  updateButtons();
  messageEl.textContent = message;

  // Check if player is out of chips
  if (gameState.player.chips <= 0) {
    setTimeout(() => {
      messageEl.textContent = "Game over! You're out of chips.";
      resetGame();
    }, 2000);
  }
}

// Reset the game
function resetGame() {
  gameState.player.bet = 0;
  gameState.isGameActive = false;
  gameState.isPlayerTurn = false;
  gameState.hasBlackjack = false;
  gameState.isBusted = false;
  gameState.playerHand.cards = [];
  gameState.dealer.cards = [];
  gameState.playerHand.sum = 0;
  gameState.dealer.sum = 0;

  // Reset bet buttons
  betButtons.forEach((btn) => btn.classList.remove("active"));

  updateDisplay();
  updateButtons();

  if (gameState.player.chips <= 0) {
    gameState.player.chips = 100; // Give player a fresh start
    messageEl.textContent = "New game started with ₹100 chips!";
  } else {
    messageEl.textContent = "Place your bet to start a new game!";
  }
}

// Update button states
function updateButtons() {
  const canDouble =
    gameState.isPlayerTurn &&
    gameState.playerHand.cards.length === 2 &&
    gameState.player.bet * 2 <= gameState.player.chips;

  startBtn.disabled = gameState.isGameActive || gameState.player.bet === 0;
  hitBtn.disabled = !gameState.isPlayerTurn;
  standBtn.disabled = !gameState.isPlayerTurn;
  doubleBtn.disabled = !canDouble;
}

// Update display
function updateDisplay() {
  // Update chips and bet
  playerChipsEl.textContent = gameState.player.chips;
  currentBetEl.textContent = gameState.player.bet;

  // Update dealer cards and sum
  dealerCardsEl.innerHTML = "";
  gameState.dealer.cards.forEach((card) => {
    dealerCardsEl.appendChild(createCardElement(card));
  });

  // Show dealer sum only if not player's turn or game ended
  if (!gameState.isPlayerTurn || !gameState.isGameActive) {
    dealerSumEl.textContent = `Sum: ${gameState.dealer.sum}`;
  } else {
    // Calculate dealer's visible sum (excluding hidden card)
    let visibleSum = 0;
    for (let i = 1; i < gameState.dealer.cards.length; i++) {
      const card = gameState.dealer.cards[i];
      visibleSum += getCardValue(card);
    }
    dealerSumEl.textContent = `Sum: ${visibleSum} + ?`;
  }

  // Update player cards and sum
  playerCardsEl.innerHTML = "";
  gameState.playerHand.cards.forEach((card) => {
    playerCardsEl.appendChild(createCardElement(card));
  });
  playerSumEl.textContent = `Sum: ${gameState.playerHand.sum}`;
}

// Create card element
function createCardElement(card) {
  const cardEl = document.createElement("div");
  cardEl.className = "card";

  if (card.isHidden) {
    cardEl.classList.add("card-back");
    return cardEl;
  }

  const valueEl = document.createElement("div");
  valueEl.className = "card-value";
  valueEl.textContent = card.value;

  const suitTopEl = document.createElement("div");
  suitTopEl.className = `card-suit top ${card.suit}`;
  suitTopEl.innerHTML = getSuitSymbol(card.suit);

  const suitBottomEl = document.createElement("div");
  suitBottomEl.className = `card-suit bottom ${card.suit}`;
  suitBottomEl.innerHTML = getSuitSymbol(card.suit);

  cardEl.appendChild(suitTopEl);
  cardEl.appendChild(valueEl);
  cardEl.appendChild(suitBottomEl);

  return cardEl;
}

// Get card value for calculation
function getCardValue(card) {
  if (card.value === "A") return 11;
  if (["K", "Q", "J"].includes(card.value)) return 10;
  return parseInt(card.value);
}

// Get suit symbol
function getSuitSymbol(suit) {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
    default:
      return "";
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", initGame);
