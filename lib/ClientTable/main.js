const crypto = require('crypto');

const {padStart} = require('../misc.js');
const logging = require('../logging.js');
const log = logging.makeLogger('ClientTable');

function ClientTable() {

    const self = this;

    var table = {};

    var client_count = 0;

    this.addClient = (socket,root) => {
        let id = '';
        do {
            let randbyte = crypto.randomBytes(16);
            id = randbyte.toString('hex');
        } while (id in table);
        table[id] = {
            guid: id,
            socket_id: socket.id,
            root,
        }
        ++client_count;
        return id;
    }

    this.updateClient = (id,info) => {
        if(id in table) {
            for(let key in table[id]) {
                table[id][key] = info[key];
            }
        } else {
            log('id not found');
        }
    }

    this.getClientRoot = (id) => {
        logging.startTimer('lookup_time');
        if(id in table) {
            logging.stopTimer('lookup_time');
            log('lookup_time:',logging.timerResults('lookup_time'));
            return table[id].root;
        } else {
            logging.stopTimer('lookup_time');
            log('lookup_time:',logging.timerResults('lookup_time'));
            log('id not found');
        }
    }

    this.getClient = (id) => {
        if(id in table) {
            return Object.assign({},table[id]);
        } else {
            log('id not found');
        }
    }

    this.removeClient = (id) => {
        if(id in table) {
            delete table[id];
            --client_count;
        } else {
            log('id not found');
        }
    }
}

module.exports = ClientTable;
