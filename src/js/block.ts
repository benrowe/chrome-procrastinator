import queryString from "./query-string";

let redirect: string = queryString.getParameterByName('r', window.location.href);

if (redirect !== '') {
    document.getElementById('url').innerText = redirect;
    document.getElementById('url').setAttribute('href', redirect);
}
