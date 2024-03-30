let bets = [];
const winners = [];
let timerRef = null;

function randomNumber(min = 1, max = 9) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setRound() {
  document.getElementById("current-round").innerText =
    "#" + (winners.length + 1);
}
/**
 * populate buttons
 * */
function populate() {
  const betElement = document.getElementById("bet-buttons");
  betElement.innerHTML = betOptions
    .map(
      (bet, index) =>
        `<button
        data-bs-toggle="modal" data-bs-target="#exampleModal"
        class="btn ${bet?.class ?? "btn-info"}"
        key='${index}'
        onclick="chooseBet(${index})"
        >${bet.label}</button>`
    )
    .join(" ");
}

function populateTable() {
  const betElement = document.getElementById("winner-tbody");
  betElement.innerHTML = winners
    .map(
      (bet, index) =>
        `<tr>
            <td>#${index + 1}</td>
            <td>${bet.label}</td>
            <td>${Array.isArray(bet.value) ? bet.value.join() : bet.value}</td>
            </tr>`
    )
    .join(" ");
}
function populatebets() {
  const betElement = document.getElementById("bets-tbody");
  // { userName: person, amount: betAmount, betRule: bet }
  betElement.innerHTML = bets
    .map(
      (bet, index) =>
        `<tr>
        <td>${index + 1}</td>
              <td>#${bet.round}</td>
              <td>${bet.userName}</td>
              <td>${bet.amount}₹</td>
              </tr>`
    )
    .join(" ");
}

function addBet(event) {
  const formData = new FormData(event);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  const { name: person, amount: betAmount, betIndex } = data;
  const userIndex = bets
    .filter((el) => el.round == winners.length)
    .findIndex((el) => el.userName == person);
  const bet = betOptions[betIndex];
  if (!bet || !person || !betAmount)
    return alert("some filled or value is missing or incorrect.");
  if (userIndex == -1) {
    bets.push({
      round: winners.length + 1,
      userName: person,
      amount: betAmount,
      betRule: bet,
    });
  } else {
    alert("This user already done bet. Only one allowed to one person.");
  }
  event.reset();
  populatebets();
}
function chooseBet(index) {
  const bet = betOptions[index];
  document.getElementById("betIndex").value = index;
  document.getElementById("for-bet").innerText = bet.label;
}
function disableAll() {
  const parentElement = document.getElementById("bet-buttons");
  var children = parentElement.children;
  for (var i = 0; i < children.length; i++) {
    if (children[i].tagName === "BUTTON") {
      children[i].disabled = true;
    }
  }
}
function calculateWinner() {
  // { userName: person, amount: betAmount, betRule: bet }
  const notes = {};
  bets
    .filter((el) => el.round == winners.length)
    .forEach((el) => {
      const {
        betRule: { label, return_percentage },
        amount,
      } = el;
      if (notes?.[label]) {
        notes[label].bet += amount;
        notes[label].cost += amount * return_percentage;
        notes[label]["winners"] = [...notes[label]["winners"], el];
      } else {
        notes[label] = {};
        notes[label].bet = amount;
        notes[label].cost = amount * return_percentage;
        notes[label]["winners"] = [el];
      }
    });

  const arr = Object.entries(notes);
  arr.sort((a, b) => {
    return b[1] - a[1];
  });
  const winner_bet = betOptions.find((el) => el.label == arr[0][0]);
  if (winner_bet) {
    winners.push({
      ...winner_bet,
      total_bets: bets.filter((el) => el.round == winners.length),
      logs: notes,
    });
  } else alert("winner_bet empty.");

  populate();
  populateTable();
  setRound();
}

function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  timerRef = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = minutes + ":" + seconds;
    if (minutes + ":" + seconds == "00:30") {
      disableAll();
    }
    if (--timer < 0) {
      timer = duration;
      calculateWinner();
    }
  }, 1000);
}

window.addEventListener("load", function () {
  populate();
  setRound();
  var threeMinutes = 60 * 3,
    display = document.querySelector("#timer");
  startTimer(threeMinutes, display);
});
