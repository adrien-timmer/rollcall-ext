async function trackPlayer() {
  clearErrorMessage();

  console.log('test');

  if (getPlayersFromLocalStorage.length >= 10) {
    showErrorMessage('Rollcall can currently only support up to 10 players');
    return;
  }

  let playerName = getTrackPlayerName();
  if (playerName == null || playerName === '') {
    return;
  }

  clearPlayerNameInput();

  let request = new XMLHttpRequest();
  request.timeout = 10000;
  request.open("GET", `https://rollcall-ext.ca/api/Player/${playerName}`);
  request.onreadystatechange = async function () {
    if (this.status == 200 && this.readyState == 4) {
      var playerId = JSON.parse(request.response).playerId;
      await addPlayerToLocalStorage({ name: playerName, id: playerId });
      addPlayerElement({ name: playerName, id: playerId });
    } else if (this.readyState == 4) {
      console.log('an error was occurred while attempting to retrieve a player id');
      console.error(this.status);
      if (this.status == 404) {
        showErrorMessage("Failed to find a player with the specified name")
      } else {
        showErrorMessage("An error occurred while attempting to resolve the player name");
      }

      clearPlayerNameInput();
    }
  }

  request.send();
}

function getTrackPlayerName() {
  return document.getElementById('track-player-input').value;
}

function clearPlayerNameInput() {
  return (document.getElementById('track-player-input').value = '');
}

async function addPlayerToLocalStorage(player) {
  let players = await getPlayersFromLocalStorage();
  if (players.findIndex((o) => o.id == player.id) == -1) {
    players.push(player);
    await browser.storage.local.set({ players: JSON.stringify(players) });
  }
}

async function getPlayersFromLocalStorage() {
  let storageResponse = await browser.storage.local.get('players');
  let players = storageResponse.players;
  if (players == null || players == undefined || players === '') {
    players = [];
    await browser.storage.local.set({ players: JSON.stringify(players) });
  } else {
    players = JSON.parse(players);
  }

  return players;
}

function addPlayerElement(player) {
  let trackedPlayerList = document.getElementById('tracked-player-list');

  //Checkbox
  let playerCheckbox = document.createElement('input');
  playerCheckbox.type = 'checkbox';
  playerCheckbox.value = player.name;
  playerCheckbox.className = 'untrack-checkbox';
  playerCheckbox.name = 'untrack-checkbox';

  //Player Div
  let playerElem = document.createElement('div');
  playerElem.className = 'player';
  playerElem.textContent = player.name;
  playerElem.appendChild(playerCheckbox);

  //Player List Item
  let playerListItem = document.createElement('li');
  playerListItem.appendChild(playerElem);

  trackedPlayerList.appendChild(playerListItem);
}

function getCheckedPlayers() {
  let checkboxes = document.getElementsByName('untrack-checkbox');
  let checkedPlayers = [];
  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      checkedPlayers.push(checkboxes[i]);
    }
  }

  return checkedPlayers;
}

async function renderTrackedPlayers() {
  let players = await getPlayersFromLocalStorage();
  players.forEach(addPlayerElement);
}

async function removePlayersFromLocalStorage(playerCheckboxes) {
  let players = await getPlayersFromLocalStorage();
  playerCheckboxes.forEach(playerCheckbox => {
    let playerIndex = players.findIndex((o) => o.name == playerCheckbox.value);
    if (playerIndex > -1) {
      players.splice(playerIndex, 1);
    }
  });

  await browser.storage.local.set({ players: JSON.stringify(players) });
}

function untrackPlayers() {
  clearErrorMessage();

  let checkedPlayerCheckboxes = getCheckedPlayers();
  checkedPlayerCheckboxes.forEach(playerCheckbox => {
    //Find the parent element
    playerCheckbox.parentNode.parentNode.parentNode.removeChild(
      playerCheckbox.parentNode.parentNode
    );
  });

  //Remove the player from storage
  removePlayersFromLocalStorage(checkedPlayerCheckboxes);
}

function showErrorMessage(firstLine, secondLine) {
  let errorContainer = document.getElementById('error-container');
  errorContainer.className = "error-container";

  let errorMessageFirstLine = document.getElementById('error-message-first-line');
  errorMessageFirstLine.textContent = firstLine;

  if (secondLine !== null && secondLine !== "") {
    let errorMessageSecondLine = document.getElementById('error-message-second-line');
    errorMessageSecondLine.textContent = secondLine;
  }
}

function clearErrorMessage() {
  let errorContainer = document.getElementById('error-container');
  errorContainer.className = "hidden";

  let errorMessageFirstLine = document.getElementById('error-message-first-line');
  errorMessageFirstLine.textContent = '';

  let errorMessageSecondLine = document.getElementById('error-message-second-line');
  errorMessageSecondLine.textContent = '';
}

renderTrackedPlayers();

document
  .getElementById('track-player-button')
  .addEventListener('click', trackPlayer);

document.getElementById('track-player-input')
  .addEventListener('keyup', function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById('track-player-button').click();
    }
  });

document
  .getElementById('untrack-player-button')
  .addEventListener('click', untrackPlayers); 
