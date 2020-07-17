const trigger1 = {id: 'T0001', title: 'お店のＨＰ表示', type: 'GPS', dateFrom: '2020/07/01 00:00:00', dateTo: '2020/07/20 00:00:00',  lat: '35.689604', lng: '139.692305', range: '86000', interval: '01:20', precision: 100, pointInterval: 'everyTime', point: 30, isSound: '1', videoID: '', textContents: 'aaaaaaaaaaaaaaaaaaaaaa', webURL : 'https://corona-matome.net/211100-2/comment-page-1/', icon: 'aaa.jpg', iconURL: 'https://corona-matome.net/211100-2/comment-page-1/', relatedSite: '関連サイト表示', relatedSiteURL: 'https://corona-matome.net/211100-2/comment-page-1/', historyName: 'コーラス商店', historyComent: '50％引クーポン付', historyPoint: 10, historyIcon: 'title001.jpg'};
const trigger2 = {id: 'T0002', title: 'お店のＨＰ表示', type: 'TIMER', dateFrom: '2020/07/01 00:00:00', dateTo: '2020/07/20 00:00:00',  lat: '35.689604', lng: '139.692305', range: '', interval: 'day', precision: 100, pointInterval: '10:00', point: 20, isSound: '1', videoID: 'VEDuOSibLyQ', textContents: 'aaaaaaaaaaaaaaaaaaaaaa', webURL : 'https://q-az.net/remove-native-javascript/'};
const trigger3 = {id: 'T0003', title: 'お店のＨＰ表示', type: 'QR AND GPS', dateFrom: '2020/07/01 00:00:00', dateTo: '2020/07/20 00:00:00',  lat: '', lng: '', range: '', interval: 'day', precision: 100, pointInterval: '10:00', point: 10, isSound: '1', videoID: 'VEDuOSibLyQ', textContents: 'aaaaaaaaaaaaaaaaaaaaaa', webURL : 'https://q-az.net/remove-native-javascript/'};
const trigger4 = {id: 'T0004', title: 'お店のＨＰ表示', type: 'QR', dateFrom: '2020/07/01 00:00:00', dateTo: '2020/07/20 00:00:00',  lat: '', lng: '', range: '', interval: 'day', precision: 100, pointInterval: '10:00', point: 3, isSound: '1', videoID: 'VEDuOSibLyQ', textContents: 'aaaaaaaaaaaaaaaaaaaaaa', webURL : 'https://q-az.net/remove-native-javascript/'};
const triggers = [];
triggers.push(trigger1);
triggers.push(trigger2);
triggers.push(trigger3);
triggers.push(trigger4);
setStorage('triggers', triggers);

const siteSettings = {reload: 1, title: 'QRプラス', url: 'qrplus.html'};
setStorage('QRPlusSettings', siteSettings);

const db = new Dexie('QRPlus');
db.version(1).stores({
    triggerHistories: '++id, triggerId, date',
    pointHistories: '++id, triggerId, date, point',
});

const triggerHistoryP =  db.triggerHistories.toArray().then(function(triggerHistories){
    const lastTriggerHistories= {};
    triggerHistories.forEach(function(triggerHistory){
        const triggerId = triggerHistory['triggerId'];
        if(lastTriggerHistories[triggerId]){
            if(lastTriggerHistories[triggerId]['date'] < triggerHistory['date']){
                lastTriggerHistories[triggerId] = {date: triggerHistory['date']};
            }
        }
        else{
            lastTriggerHistories[triggerId] = {date: triggerHistory['date']};
        }
    });
    setStorage('lastTriggerHistory', lastTriggerHistories);
});
const pointHistoryP = db.pointHistories.toArray().then(function(pointHistories){
    const lastPointHistories= {};
    pointHistories.forEach(function(pointHistory){
        const triggerId = pointHistory['triggerId'];
        if(lastPointHistories[triggerId]){
            if(lastPointHistories[triggerId]['date'] < pointHistory['date']){
                lastPointHistories[triggerId] = {date: pointHistory['date']};
            }
        }
        else{
            lastPointHistories[triggerId] = {date: pointHistory['date']};
        }
    });
    setStorage('lastPointHistory', lastPointHistories);
    
});
Promise.all([triggerHistoryP, pointHistoryP]).then(function(){
	
// GPSチェック(定期実行)
const checkGPS = function(){
	const triggers = getStorage('triggers');
	const GPStriggers = triggers.filter(GPSfilterTrigger);
	if(GPStriggers.length > 0){
		const GPStrigger = GPStriggers[0];
		const getCurrentPosition = function(options){
			return new Promise(function(resolve, reject) {
				navigator.geolocation.getCurrentPosition(resolve, reject, options);
			});
		}
		getCurrentPosition().then((position) => {
			const dist = distance(position.coords.latitude, position.coords.longitude, GPStrigger['lat'], GPStrigger['lng']);
			let isPoint = false;
			// 距離OK
			if(dist <= GPStrigger['range'] * 1){
				// トリガー履歴登録
				const promiseList = [];
				const insertTHistoryP = insertTriggerHistory(GPStrigger);
				promiseList.push(insertTHistoryP);
				const isPoint = checkPointHistory(GPStrigger);
				let insertPHistoryP;
				if(isPoint){
						// ポイント付与
					insertPHistoryP = insertPointHistory(GPStrigger);
					promiseList.push(insertPHistoryP);
				}
				Promise.all(promiseList).then(function(){
					if(isPoint && GPStrigger['isSound'] == '1'){
						if(window.navigator.vibrate){
							window.navigator.vibrate(200);
						}
						else if(window.navigator.mozVibrate){
							window.navigator.mozVibrate(200);
						}
						else if(window.navigator.webkitVibrate){
							window.navigator.webkitVibrate(200);
						}
					}
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
	setTimeout(checkGPS, 10000);
};

if(navigator.geolocation){
	checkGPS();
}
// 時刻チェック
const checkTimer = function(){
	const triggers = getStorage('triggers');
	const timerTriggers = triggers.filter(TimerfilterTrigger);
	if(timerTriggers.length > 0){
		const timerTrigger = timerTriggers[0];
		// トリガー履歴登録
		const promiseList = [];
		const insertTHistoryP = insertTriggerHistory(timerTrigger);
		promiseList.push(insertTHistoryP);
		const isPoint = checkPointHistory(timerTrigger);
		let insertPHistoryP;
		if(isPoint){
				// ポイント付与
			insertPHistoryP = insertPointHistory(timerTrigger);
			promiseList.push(insertPHistoryP);
		}
		Promise.all(promiseList).then(function(){
			if(timerTrigger['isSound'] == '1'){
				soundPointGet('audio-win');
			}
			setTimeout(function(){
				window.location.href = 'contents.html?trigger=' + GPStrigger['id'] + '&ispoint=' + isPoint;
			}, 1000);
		});
	}
	setTimeout(checkTimer, 3000);
};
checkTimer();
});