function removeSpinner() {
    let spinner = document.getElementById('spinner');
    spinner.remove();
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

function showErrorMessage(message, dimissable = true, autoDismiss = false) {
    let alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-dismissible alert-danger message';
    alertDiv.textContent = message;

    if (dimissable === true) {
        let alertButton = document.createElement('button');
        alertButton.className = 'close';
        alertButton.textContent = String.fromCharCode(215); //215 -> multiplication symbol (small x)
        alertButton.addEventListener('click', () => {
            alertDiv.remove();
        });
        alertDiv.appendChild(alertButton);
    }

    let alertsContainer = document.getElementById('alerts')
    alertsContainer.appendChild(alertDiv);

    if (autoDismiss === true) {
        //auto dismiss the alert since it can take up a fair bit of space
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}