const React = require('react');
const {renderToString} = require('react-dom/server');

const App = require('../webpack/react/containers/App.js');

const Login = require('../webpack/react/containers/Login.js');

exports.htmlBody = function htmlBody(page,render = {}) {
	let element = null;
	let script = '';
	let title = '';
	let username = (render.username) ? ' - '+render.username : '';
	let obj = {};

	switch (page) {
		case 'fs':
			element = App;
			script = 'fs.js';
			title = 'browse';
			if('content' in render) {
				console.log('here');
				obj.dir = render.content.dir;
			}
			break;
		case 'login':
			element = Login;
			script = 'login.js';
			title = 'login';
			break;
		default:
	}

    return `
<!doctype html>
<html>
	<head>
		<title>TDS CDN${username} - ${title}</title>
		<meta charset="utf-8">
		<meta name="description" content="cdn for TDS">
		<meta name="author" content="David A Cathers">
		<meta name="keywords" content="cdn,TDS,David Cathers,David C,DAC098,dac098,o98dac">
		<link rel="stylesheet" type='text/css' href="/style/main.css">
	</head>
	<body>
		<div id="render">${renderToString(React.createElement(element,obj))}</div>
		<script async src="/scripts/${script}"></script>
	</body>
</html>`;
};
