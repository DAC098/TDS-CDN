exports.sendJSON = function sendJSON(url,obj) {
	let base_url = window.location.origin + url;
	return new Promise(function(resolve,reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('post',base_url,true);
		xhr.setRequestHeader('Content-type','application/json');
		xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xhr.onreadystatechange = () => {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				let {status,response} = xhr;
				resolve({status,response});
			}
		};
		xhr.send(JSON.stringify(obj));
	});
};
