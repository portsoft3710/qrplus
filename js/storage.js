function getStorage(key){
	if(localStorage.getItem(key)){
		return JSON.parse(localStorage.getItem(key));
	}
	else{
		return {[key]: ''};
	}
}
function setStorage(key, value){
	localStorage.setItem(key, JSON.stringify(value));
}
function addStorage(key, value){
	const list = getStorage(key);	
	list.push(value);
	setStorage(key, list);
	
}
function updatePoint(point){
	let currentPoint = getStorage('QRPoint');
	currentPoint = isNaN(currentPoint) ? 0 : currentPoint * 1;
	currentPoint = currentPoint + point * 1;
	setStorage('QRPoint', currentPoint);
}
function getSessionStorage(key){
	if(sessionStorage.getItem(key)){
		return JSON.parse(sessionStorage.getItem(key));
	}
	else{
		return {[key]: ''};
	}
}
function setSessionStorage(key, value){
	sessionStorage.setItem(key, JSON.stringify(value));
}
