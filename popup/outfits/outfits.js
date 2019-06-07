async function loadOutfitMembers() {

    let outfitIds = await getOutfitIds();
    if (outfitIds.length <= 0) {
        removeSpinner();
        showNoOutfitWarning();
        return;
    }

    let request = new XMLHttpRequest();
    request.timeout = 15000;
    request.open("GET", `https://rollcall-ext.ca/api/Outfit/${outfitIds.valueOf()}/members`);
    request.onreadystatechange = async function () {
        if (this.status == 200 && this.readyState == 4) {
            removeSpinner();
            let members = JSON.parse(request.response);
            members.forEach(player => {
                addMemberElement(player);
            });
        } else if (this.readyState == 4) {
            removeSpinner();
            console.log('an error was occurred while attempting to retrieve outfit members');
            console.error(this.status);
            showErrorMessage('An error occured while loading outfit members', false);
        }
    }

    request.send();
}

function addMemberElement(member) {
    let listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.textContent = `[${member.outfitAlias}] ${member.name}`;

    let badge = document.createElement('span');
    badge.className = member.online === true ? 'badge badge-success badge-pill' : 'badge badge-secondary badge-pill';
    badge.textContent = member.online === true ? 'Online' : 'Offline';
    listItem.appendChild(badge);

    let memberList = document.getElementById('member-list');
    memberList.appendChild(listItem);
}

async function getOutfitIds() {
    let storageResponse = await browser.storage.local.get('players');
    let players = storageResponse.players;
    if (players == null || players == undefined || players === '') {
        players = [];
        await browser.storage.local.set({ players: JSON.stringify(players) });
    } else {
        players = JSON.parse(players);
    }

    return await Promise.all(players.map((p) => {
        return getOutfitId(p.id);
    }))
        .then((ids) => {
            return ids;
        });
}

function getOutfitId(playerId) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `https://rollcall-ext.ca/api/Player/${playerId}/outfit`);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response).outfitId);
            } else {
                showErrorMessage("An error occurred while attempting to resolve a player's outfit", true, true);
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            showErrorMessage("An error occurred while attempting to resolve a player's outfit", true, true);
            reject();
        };
        xhr.send();
    });
}

function showNoOutfitWarning() {
    let alert = document.getElementById('no-outfit-warning');
    alert.className = 'alert alert-secondary';
}

loadOutfitMembers();