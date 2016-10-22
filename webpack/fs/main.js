var React = require('react');
var {render} = require('react-dom');

var App = require('../react/containers/App.js');

render(React.createElement(App),document.getElementById('render'));
