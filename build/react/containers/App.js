var React = require('react');
var socket = require('../../socket.js');
var store = require('../../Store.js');
var {joinPath,splitPath} = require('../../misc.js');

var DirContents = require('../components/DirContents.js');
var FileContents = require('../components/FileContents.js');
var Header = require('../components/Header.js');

var App = React.createClass({
    getInitialState: function() {
        return {
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
        socket.on('dir-update',self.checkCurrentDir);

        socket.on('dir-list',(data) => self.handleData('dir',data));
        socket.on('dir-not-found',() => {
            console.log('directory not found');
            self.request();
        });

        socket.on('file-data',(data) => self.handleData('file',data));
        socket.on('file-not-found',() => {
            console.log('file not found');
            self.request();
        });

        socket.on('upload-complete',() => console.log('upload complete'));
        socket.on('upload-failed',() => console.log('upload failed'));
        socket.on('upload-exists',() => console.log('upload exists'));

        socket.on('remove-complete',() => {
            console.log('remove complete');
            self.request('back');
        });
        socket.on('remove-failed',() => console.log('remove failed'));

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
    checkCurrentDir: function(location) {
        // FIX ME HERE
        let {nav} = this.state;
        let check = joinPath(nav.path);
        if(check === location) {
            socket.emit('dir-request',location);
        }
    },
    // ------------------------------------------------------------------------
    // navigation
    // ------------------------------------------------------------------------
    handleData: function(type,returned) {
        let {dir,file,nav,request} = this.state;
        let {data} = returned;
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
            console.log('no data returned from request');
        }
    },
    request: function(direction,type,path) {
        let {nav,request,dir} = this.state;
        let go_back = false,
            full_path = '';
        switch (direction) {
            case 'forward':
                console.log('going down directory');
                request.path.push(path);
                break;
            case 'back':
                console.log('going up direcotory');
                request.path.pop();
                type = 'dir';
                go_back = true;
                break;
            case 'returned':
                console.log('returning to saved nav');
                request.path = path;
                break;
            default:
                type = 'dir';
                request.path = [];
                console.log('requesting root directory');
        }
        full_path = joinPath(request.path);
        request.filled = false;
        switch (type) {
            case 'file':
                request.type = type;
                console.log('requesting file');
                socket.emit('file-request',full_path);
                break;
            case 'dir':
                request.type = type;
                if(go_back && nav.type.file && dir.length !== 0) {
                    console.log('returning to stored dir');
                    this.handleData('dir',{data: true});
                } else {
                    console.log('requesting dir');
                    socket.emit('dir-request',full_path);
                }
                break;
            default:
                console.log('unknown type:',type);
        }
        this.setState({nav,request});
    },
    // ------------------------------------------------------------------------
    // uploading content
    // ------------------------------------------------------------------------
    uploadFiles: function(files) {
        let {nav} = this.state;
        for(let item of files) {
            console.log('file:',item);
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
            view = <DirContents dir={state.dir} request={this.request} />
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
