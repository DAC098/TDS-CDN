const Server = require('./lib/server.js');

const settings = require('./settings.json');

var main = new Server();

if(settings.https.enabled) {
    main.startHTTPS();
}

main.startHTTP();
