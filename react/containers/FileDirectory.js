var React = require('react');
var socket = require('../../socket.js');

var DirContents = require('../components/DirContents.js');

var FileDirectory = React.createClass({
    getInitialState: function() {
        return {
            dir: {
                parent: '',
                current: '',
                contents: [],
                request: '',
            },
            file: {
                data: {}
            },
            request: {
                file: false,
                dir: false,
                filled: false,
            }
        }
    },
    componentDidMount: function() {
        var self = this;
        socket.on('dir-list',self.handleList);
        socket.on('file-data',self.handleFile);
        socket.emit('dir-request','/');
    },
    handleList: function(data) {
        var {dir,request} = this.state;
        if(data.list.length > 0) {
            dir.contents = data.list;
            dir.parent = dir.current;
            dir.current = dir.request;
            request.file = request.dir = false;
            request.filled = true;
            this.setState({dir,request});
        } else {
            console.log('directory list is empty');
        }
    },
    handleFile: function(info) {
        var keys = Object.keys(info);
        var {dir,file,request} = this.state;
        if(keys.length > 0) {
            dir.parent = dir.current;
            dir.current = dir.request;
            file.data = info;
            request.file = request.dir = false;
            request.filled = true;
            this.setState({dir,file,request});
        } else {
            console.log('file data is empty');
        }
    },
    requestFile: function(path) {
        var {request,dir} = this.state;
        request.file = true;
        request.dir = false;
        request.filled = false;
        dir.request = path;
        socket.emit('file-request',path);
        this.setState({dir,request});
    },
    requestFolder: function(path) {
        var {request,dir} = this.state;
        request.file = false;
        request.dir = true;
        request.filled = false;
        dir.request = path;
        socket.emit('dir-request',path);
    },
    render: function() {
        var {state} = this;
        return (
            <DirContents dir={state.dir} requestFile={this.requestFile} requestFolder={this.requestFolder} />
        )
    }
});

module.exports = FileDirectory;
