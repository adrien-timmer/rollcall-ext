async function loadFriends() {

    let playerIds = await getPlayerIds();
    if (playerIds.length <= 0) {
        removeSpinner();
        showNoPlayersWarning();
        return;
    }

    let request = new XMLHttpRequest();
    request.timeout = 10000;
    request.open("GET", `https://rollcall-ext.ca/api/Player/${playerIds.valueOf()}/friends`);
    request.onreadystatechange = async function () {
        if (this.status == 200 && this.readyState == 4) {
            removeSpinner();
            let players = JSON.parse(request.response);
            let current = new Date();
            players.forEach(player => {
                addPlayerElement(player, current);
            });
        } else if (this.readyState == 4) {
            removeSpinner();
            console.log('an error was occurred while attempting to retrieve friends');
            console.error(this.status);
            showErrorMessage('An error occured while loading friends', false);
        }
    }

    request.send();
}

function addPlayerElement(player, currentTime) {
    let listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.textContent = player.name;
    listItem.title = `${player.name} last logged in on: ${new Date(player.lastOnline.toString()).toString()}`

    let badge = document.createElement('span');
    badge.className = player.online === true ? 'badge badge-success badge-pill' : 'badge badge-secondary badge-pill';
    badge.textContent = getRelativeTime(currentTime, player.lastOnline);
    listItem.appendChild(badge);

    let friendList = document.getElementById('friend-list');
    friendList.appendChild(listItem);
}

async function getPlayerIds() {
    let storageResponse = await browser.storage.local.get('players');
    let players = storageResponse.players;
    if (players == null || players == undefined || players === '') {
        players = [];
        await browser.storage.local.set({ players: JSON.stringify(players) });
    } else {
        players = JSON.parse(players);
    }

    return players.map((p) => {
        return p.id;
    });
}

function showNoPlayersWarning() {
    let alert = document.getElementById('no-players-warning');
    alert.className = 'alert alert-secondary';
}

loadFriends();