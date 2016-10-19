var React = require('react');
// var socket = require('../../login/login_socket.js');
var store = require('../../Store.js');

var log = require('../../CLogs.js').makeLogger('Login');
var {sendJSON} = require('../../xhr.js');

var Login = React.createClass({
    getInitialState: function() {
        return {
            input: {
                username: '',
                password: ''
            },
            valid: {
                username: true,
                password: true
            }
        }
    },
    componentDidMount: function() {
        var self = this;
        log('login mounted');
    },
    handleInput: function(key) {
        let {input} = this.state;
        input[key] = this.refs[key].value;
        this.setState({input});
    },
    sendCheck: function(event) {
        event.preventDefault();
        let {input,valid} = this.state;
        let {username,password} = input;
        let promise = sendJSON('/fs/login/check',{username,password});
        promise.then((data) => {
            log('obj',data);
            if(data.status >= 400) {
                let obj = JSON.parse(data.response);
                valid.username = obj.username;
                valid.password = !obj.username;
                log((!valid.username) ? 'invalid username' : 'invalid password');
                this.setState({valid});
            } else if(data.status === 300) {
                log('redirecting');
                let url = JSON.parse(data.response).url;
                let redirect = window.location.origin + url;
                window.location = redirect;
            } else {
                log('status code',data.status);
            }
        });
    },
    //
    render: function() {
        return (
            <form id='login' ref='login'>
                <input ref='username' onChange={() => this.handleInput('username')}
                    name='username' type='text' placeholder='Username' value={this.state.input.username}/>
                <input ref='password' onChange={() => this.handleInput('password')}
                    name='password' type='text' placeholder='Password' value={this.state.input.password}/>
                <input type='button' onClick={(event) => this.sendCheck(event)} value='Login' />
            </form>
        )
    }
});

module.exports = Login;
