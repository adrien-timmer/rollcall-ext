async function trackPlayer() {
  let playerName = getTrackPlayerName();
  if (playerName == null || playerName === '') {
    return;
  }

  //Fire off a request to the
  //If we get a 404, show an error.
  //If we get anything that isn't successful, show an error
  //If we get a success, toss it into local storage
  await addPlayerToLocalStorage(playerName);
  clearPlayerNameInput();
  addPlayerElement(playerName);
}

function getTrackPlayerName() {
  return document.getElementById('track-player-input').value;
}

function clearPlayerNameInput() {
  return (document.getElementById('track-player-input').value = '');
}

async function addPlayerToLocalStorage(playerName) {
  let players = await getPlayersFromLocalStorage();
  if (players.indexOf(playerName) == -1) {
    players.push(playerName);
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
  playerCheckbox.value = player;
  playerCheckbox.className = 'untrack-checkbox';
  playerCheckbox.name = 'untrack-checkbox';

  //Player Div
  let playerElem = document.createElement('div');
  playerElem.className = 'player';
  playerElem.textContent = player;
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
    let playerIndex = players.indexOf(playerCheckbox.value);
    if (playerIndex > -1) {
      players.splice(playerIndex, 1);
    }
  });

  await browser.storage.local.set({ players: JSON.stringify(players) });
}

function untrackPlayers() {
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

renderTrackedPlayers();

document
  .getElementById('track-player-button')
  .addEventListener('click', trackPlayer);

document
  .getElementById('untrack-player-button')
  .addEventListener('click', untrackPlayers); 
