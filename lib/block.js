var redirect = getParameterByName('r', window.location.href);
if (redirect) {
    document.getElementById('url').innerText = redirect;
    document.getElementById('url').setAttribute('href', redirect);
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}