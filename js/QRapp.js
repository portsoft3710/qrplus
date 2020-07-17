if(!navigator.mediaDevices) {
    document.querySelector('#js-unsupported').classList.add('is-show');
}

const video = document.querySelector('#js-video');
const canvas = document.querySelector('#js-canvas');
const ctx = canvas.getContext('2d');
const cover = document.querySelector('#js-cover-img');
const tokuten = document.querySelector('#js-tokuten-img');
const scanButton = document.querySelector('#js-scan-button');
function checkImage(){
//const checkImage =() => {

    // 取得している動画をCanvasに描画
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Canvasからデータを取得
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // jsQRに渡す
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    // QRコードの読み取りに成功したらモーダル開く
    // 失敗したら再度実行
    if(code){
        const url = code.url;
        const triggerId = url.split('?')[1];
        checkQRTrigger(triggerId);
    }
	else{
        setTimeout(() => { checkImage() }, 200);
    }
}
/*
document.querySelector('#js-modal-close')
    .addEventListener('click',() => {
        document.querySelector('#js-modal').classList.remove('is-show')
        checkImage();
    })
*/
function dispCamera(){
tokuten.classList.remove('show');
cover.classList.remove('show');
video.classList.add('show');
scanButton.classList.remove('show');
navigator.mediaDevices
    .getUserMedia({
        audio: false,
        video: {
            facingMode: {
                exact: 'environment'
            }
        }
    })
    .then(function(stream) {
        video.srcObject = stream;
        video.onloadedmetadata = function(e) {
            video.play();
            checkImage();
        }
    })
    .catch(function(err) {
        alert('Error!!');
    })
}
// QRコードを読み取った後の処理
function checkTrigger(triggerId){
    debugger;
    const triggers = getStorage('triggers');
    let QRtriggers = triggers.filter(QRfilterTrigger);
    // トリガーを QR または　QR AND GPSで絞り込む
    QRtriggers = QRtriggers.filter(function(QRtrigger){
       return QRtrigger['id'] == triggerId;
    });
    if(QRtriggers.length > 0){
        const QRTrigger = QRtriggers[0];
        if(QRTrigger['type'] == 'QR'){
			// トリガー履歴登録
			const promiseList = [];
            const insertTHistoryP = insertTriggerHistory(QRTrigger);
			promiseList.push(insertTHistoryP);
			const isPoint = checkPointHistory(QRTrigger);
			let insertPHistoryP;
			if(isPoint){
					// ポイント付与
				insertPHistoryP = insertPointHistory(QRTrigger);
				promiseList.push(insertPHistoryP);
			}
			Promise.all(promiseList).then(function(){
				if(GPSfilterTrigger['isSound'] == '1'){
					soundPointGet('audio-win');
				}
				setTimeout(function(){
					window.location.href = 'contents.html?trigger=' + GPStrigger['id'] + '&ispoint=' + isPoint;
				}, 1000);
			});
        }
        else if(QRTrigger['type'] == 'QR AND GPS'){
            const getCurrentPosition = function(options){
                return new Promise(function(resolve, reject) {
                    navigator.geolocation.getCurrentPosition(resolve, reject, options);
                });
            }
            getCurrentPosition().then((position) => {
				const dist = distance(position.coords.latitude, position.coords.longitude, QRTrigger['lat'], QRTrigger['lng']);
				// 距離OK
				if(dist <= QRTrigger['range'] * 1){
					// トリガー履歴登録
					const promiseList = [];
					const insertTHistoryP = insertTriggerHistory(QRTrigger);
					promiseList.push(insertTHistoryP);
					const isPoint = checkPointHistory(QRTrigger);
					let insertPHistoryP;
					if(isPoint){
							// ポイント付与
						insertPHistoryP = insertPointHistory(QRTrigger);
						promiseList.push(insertPHistoryP);
					}
					Promise.all(promiseList).then(function(){
						if(GPSfilterTrigger['isSound'] == '1'){
							soundPointGet('audio-win');
						}
						setTimeout(function(){
							window.location.href = 'contents.html?trigger=' + GPStrigger['id'] + '&ispoint=' + isPoint;
						}, 1000);
					});
				}
            });
        }
    }
    cover.classList.add('show');
    video.classList.remove('show');
}
