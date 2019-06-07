async function trackPlayer() {
  if (getPlayersFromLocalStorage.length >= 10) {
    showErrorMessage('Rollcall currently only supports up to 10 players', true, true);
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
      console.log('an error occurred while attempting to retrieve a player id');
      console.error(this.status);
      if (this.status == 404) {
        showErrorMessage("Failed to find a player with the specified name", true, true)
      } else {
        showErrorMessage("An error occurred while attempting to resolve the player name", true, true);
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

  let listItem = document.createElement('li');
  listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
  listItem.textContent = player.name;

  let buttonSpan = document.createElement('span');
  buttonSpan.className = 'btn btn-sm btn-danger pull-right';
  buttonSpan.textContent = 'Remove';
  buttonSpan.addEventListener('click', () => {
    removePlayerFromLocalStorage(player.name);
    listItem.remove();
  });

  listItem.appendChild(buttonSpan);

  trackedPlayerList.appendChild(listItem);
}

async function renderTrackedPlayers() {
  let players = await getPlayersFromLocalStorage();
  players.forEach(addPlayerElement);
}

async function removePlayerFromLocalStorage(playerName) {
  let players = await getPlayersFromLocalStorage();
  let playerIndex = players.findIndex((o) => o.name == playerName);
  if (playerIndex > -1) {
    players.splice(playerIndex, 1);
  }

  await browser.storage.local.set({ players: JSON.stringify(players) });
}

renderTrackedPlayers();

//Event listeners

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
