var React = require('react');
var socket = require('../../socket.js');
var store = require('../../Store.js');
var {joinPath,splitPath} = require('../../misc.js');

var DirContents = require('../components/DirContents.js');
var FileContents = require('../components/FileContents.js');
var Header = require('../components/Header.js');

var log = require('../../CLogs.js').makeLogger('App');

var App = React.createClass({
    getInitialState: function() {
        return {
            selected: new Map(),
            dir: [],
            file: {},
            request: {
                type: '',
                path: [],
                filled: false,
            },
            nav: {
                path: [],
                type: {
                    file: false,
                    dir: false,
                }
            }
        }
    },
    componentDidMount: function() {
        var self = this;
        let {nav} = this.state;
        let session_path = store.get('path'),
            session_type = store.get('type');
        socket.on('update',(response) => {
            log('update from server\ntype:',response.type,'\npath:',response.path);
            self.checkUpdate(response.type,response.path);
        });

        socket.on('request-complete',(response) => {
            log('response complete\ntype:',response.type);
            self.handleData(response.type,response.data);
        });
        socket.on('request-failed',(reason) => {
            log('request failed,\ntype:',reason.type,'\nmsg:',reason.msg);
        });

        socket.on('upload-complete',(response) => {
            log('upload complete\ntype:',response.type);
        });
        socket.on('upload-failed',(reason) => {
            log('upload failed\ntype:',reason.type,'\nmsg:',reason.msg);
        });

        socket.on('remove-complete',(response) => {
            log('remove complete,\ntype:',response.type);
            self.request('back');
        });
        socket.on('remove-failed',(reason) => {
            log('remove failed\ntype:',reason.type,'\nmsg:',reason.msg);
        });

        if(session_path && session_type) {
            self.request('returned',session_type,splitPath(session_path));
        } else {
            self.request();
        }
    },
    componentWillUnmount: function() {
        var self = this;
        socket.removeAllListeners();
        store.clear();
    },
    // ------------------------------------------------------------------------
    // checks
    // ------------------------------------------------------------------------
    checkUpdate: function(type,path) {
        let {nav} = this.state;
        let check = joinPath(nav.path);
        log('comparing current:',check,'\nto:',path);
        if(check) {
            switch (type) {
                case 'file':
                    socket.emit('request-file',path);
                    break;
                case 'dir':
                    socket.emit('request-dir',path);
                    break;
                default:

            }
        }
    },
    // ------------------------------------------------------------------------
    // navigation
    // ------------------------------------------------------------------------
    selectItem: function(key,path) {
        let {selected} = this.state;
        if(selected.has(key)) {
            selected.delete(key);
        } else {
            selected.set(key,path);
        }
        this.setState({selected});
    },
    handleData: function(type,data) {
        let {dir,file,nav,request} = this.state;
        if(data) {
            switch (type) {
                case 'dir':
                    dir = (Array.isArray(data)) ? data : dir;
                    nav.type.dir = true;
                    nav.type.file = false;
                    break;
                case 'file':
                    file = data;
                    nav.type.dir = false;
                    nav.type.file = true;
                    break;
            }
            nav.path = request.path;
            request.filled = true;
            store.set('type',type);
            store.set('path',joinPath(nav.path));
            this.setState({dir,file,nav,request});
        } else {
            log('no data returned from request');
        }
    },
    request: function(direction,type,path) {
        let {nav,request,dir,selected} = this.state;
        let go_back = false,
            full_path = '';
        switch (direction) {
            case 'forward':
                log('going down directory');
                request.path.push(path);
                break;
            case 'back':
                log('going up direcotory');
                request.path.pop();
                type = 'dir';
                go_back = true;
                break;
            case 'returned':
                log('returning to saved nav');
                request.path = path;
                break;
            case 'refresh':
                log('refreshing current location');
                type = request.type;
                break;
            default:
                log('requesting root directory');
                type = 'dir';
                request.path = [];
        }
        full_path = joinPath(request.path);
        selected.clear();
        request.filled = false;
        switch (type) {
            case 'file':
                request.type = type;
                log('requesting file');
                socket.emit('request-file',full_path);
                break;
            case 'dir':
                request.type = type;
                if(go_back && nav.type.file && dir.length !== 0) {
                    log('returning to stored dir');
                    this.handleData('dir',{data: true});
                } else {
                    log('requesting dir');
                    socket.emit('request-dir',full_path);
                }
                break;
            default:
                log('unknown type:',type);
        }
        this.setState({nav,request,selected});
    },
    // ------------------------------------------------------------------------
    // uploading content
    // ------------------------------------------------------------------------
    uploadFiles: function(files) {
        let {nav} = this.state;
        for(let item of files) {
            log('file:',item);
            let fr = new FileReader();
            fr.addEventListener('loadend',() => {
                socket.emit('upload-file',({
                    data: fr.result,
                    location: joinPath(nav.path),
                    name: item.name,
                }));
            });
            fr.readAsArrayBuffer(item);
        }
    },
    uploadDir: function(name) {

    },
    // ------------------------------------------------------------------------
    // removing content
    // ------------------------------------------------------------------------
    removeFile: function() {
        let {nav,file} = this.state;
        socket.emit('remove-file',{location:joinPath(nav.path),name:file.base});
    },
    // ------------------------------------------------------------------------
    // render
    // ------------------------------------------------------------------------
    render: function() {
        let {state} = this;
        let {nav} = state;
        let view = undefined;
        if(nav.type.file) {
            view = <FileContents file={state.file} removeFile={this.removeFile}/>
        } else {
            view = <DirContents dir={state.dir} selected={state.selected} selectItem={this.selectItem} request={this.request} />
        }
        return (
            <main className="grid">
                <Header nav={nav} info={(nav.type.file) ? state.file : state.dir} request={this.request} uploadFiles={this.uploadFiles} />
                {view}
            </main>
        )
    }
});

module.exports = App;
