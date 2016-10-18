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
                username: false,
                password: false
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
    sendCheck: function(type,event) {
        event.preventDefault();
        log('type:',type);
        log('event:',event);
        let {input,valid} = this.state;
        let promise = null;
        switch (type) {
            case 'username':
                promise = sendJSON('/fs/login/check?type=username',{username:input.username});
                promise.then((status,response) => {
                    if(status === 200) {
                        log('response:',response);
                        let obj = JSON.parse(response);
                        if(obj.valid) {
                            valid.username = true;
                            this.setState({valid});
                        } else {
                            log('invalid username');
                        }
                    } else {
                        log('status code',status);
                    }
                });
                break;
            case 'password':
                promise = sendJSON('/fs/login/check?type=password',input);
                promise.then((status,response) => {
                    if(status === 300) {
                        log('redirecting');
                    } else {
                        log('response:',response);
                    }
                });
                break;
            default:

        }
    },
    render:function() {
        let check_key = this.state.valid.username ? 'password' : 'username';
        let button_value = this.state.valid.username ? 'Login' : 'Continue';
        return (
            <form id='login' ref='login'>
                <input ref='username' onChange={() => this.handleInput('username')}
                    name='username' type='text' placeholder='Username' value={this.state.input.username}/>
                {this.state.valid.username ?
                    <input ref='password' onChange={() => this.handleInput('password')}
                        name='password' type='text' placeholder='Password' value={this.state.input.password}/>
                    :
                    null
                }
                <input type='button' onClick={(event) => this.sendCheck(check_key,event)} value='Login' />
            </form>
        )
    }
});

module.exports = Login;
