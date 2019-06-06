async function loadFriends() {

    let playerIds = await getPlayerIds();
    if (playerIds.length <= 0) {
        showErrorMessage("It doesn't look like you've tracked any players yet", "Go to Settings to get started");
        return;
    }

    startSpinner('Loading Friends');

    let request = new XMLHttpRequest();
    request.timeout = 10000;
    request.open("GET", `https://rollcall-ext.ca/api/Player/${playerIds.valueOf()}/friends`);
    request.onreadystatechange = async function () {
        if (this.status == 200 && this.readyState == 4) {
            stopSpinner();
            let players = JSON.parse(request.response);
            let current = new Date();
            players.forEach(player => {
                addPlayerElement(player, current);
            });
        } else if (this.readyState == 4) {
            stopSpinner();
            console.log('an error was occurred while attempting to retrieve friends');
            console.error(this.status);
            showErrorMessage('An error occured while loading friends');
        }
    }

    request.send();
}

function addPlayerElement(player, currentTime) {
    let friendList = document.getElementById('friend-list');

    //Status indicator
    let playerStatusElem = document.createElement('div');
    playerStatusElem.className = player.online === true ? 'online-indicator' : 'offline-indicator';

    //Player last online
    let playerLastOnlineElem = document.createElement('div');
    playerLastOnlineElem.className = 'last-online-date';
    playerLastOnlineElem.textContent = getRelativeTime(currentTime, player.lastOnline);

    //Player info
    let playerInfoElem = document.createElement('div');
    playerInfoElem.className = 'player-info';
    playerInfoElem.textContent = trimPlayerName(player.name);
    playerInfoElem.appendChild(playerLastOnlineElem);

    console.log(player.lastOnline);
    //Player List Item
    let playerListItem = document.createElement('li');
    playerListItem.title = `${player.name} Last logged in on: ${new Date(player.lastOnline.toString()).toString()}`
    playerListItem.appendChild(playerStatusElem);
    playerListItem.appendChild(playerInfoElem);

    friendList.appendChild(playerListItem);
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

function startSpinner(message) {
    let spinner = document.getElementById('spinner');
    spinner.className = 'loader';

    let spinnerStatus = document.getElementById('spinner-status');
    spinnerStatus.className = 'spinner-status';
    spinnerStatus.textContent = message;
}

function stopSpinner() {
    let spinner = document.getElementById('spinner');
    spinner.className = 'hidden';

    let spinnerStatus = document.getElementById('spinner-status');
    spinnerStatus.className = 'hidden';
    spinnerStatus.textContent = '';
}

function getRelativeTime(current, previous) {
    previous = Date.parse(previous);
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' second(s) ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minute(s) ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hour(s) ago';
    }

    else if (elapsed < msPerMonth) {
        return '~ ' + Math.round(elapsed / msPerDay) + ' day(s) ago';
    }

    else if (elapsed < msPerYear) {
        return '~ ' + Math.round(elapsed / msPerMonth) + ' month(s) ago';
    }

    else {
        return '~ ' + Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function trimPlayerName(name){
    if (name.length >= 20) {
        name = name.substring(0, 17);
        name = name + '...';
    }

    return name;
}

loadFriends();