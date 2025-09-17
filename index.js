let player = {
  name: "Rushi",
  chips: 145,
};
let sum = 0;
let cards = [];
let hasBlackjack = false;
let isAlive = false;
let message = "";
let messageEl = document.getElementById("message-el");

let playerEL = document.querySelector("#player-el");
playerEL.textContent = player.name + " :₹" + player.chips;

function getRandomCard() {
  randomCardNo = Math.floor(Math.random() * 13 + 1);
  if (randomCardNo === 1) {
    return 11;
  } else if (randomCardNo > 10) {
    return 10;
  } else {
    return randomCardNo;
  }
}

function startGame() {
  isAlive = true;
  let firstCard = getRandomCard();
  let secondCard = getRandomCard();
  cards = [firstCard, secondCard];
  sum = firstCard + secondCard;
  renderGame();
}

let sumEl = document.querySelector("#sum-el");
let cardsEl = document.querySelector("#cards-el");

function renderGame() {
  sumEl.textContent = "Sum: " + sum;
  cardsEl.textContent = "Cards: ";
  for (let i = 0; i < cards.length; i++) {
    cardsEl.textContent += cards[i] + " ";
  }

  if (sum <= 20) {
    message = "Do you want to draw a new card? ";
  } else if (sum === 21) {
    message = "Wohoo! You've got Blackjack! ";
    hasBlackjack = true;
  } else {
    message = "You're out of the game! ";
    isAlive = false;
  }
  messageEl.textContent = message;
}

function newCard() {
  if (isAlive === true && hasBlackjack === false) {
    let newCard = getRandomCard();
    sum += newCard;
    cards.push(newCard);
    console.log(cards);
    renderGame();
  }
}
