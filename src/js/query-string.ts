module QueryString {

    export function getParameterByName(key: string, url: string, defaultValue:string = ''): string
    {
        key = key.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + key + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) {
            return defaultValue;
        }
        if (!results[2]) {
            return defaultValue;
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}

export default QueryString;
