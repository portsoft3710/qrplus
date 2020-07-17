// 緯度経度から距離を計算 メートルで返す
function distance(lat1, lng1, lat2, lng2) {
  lat1 *= Math.PI / 180;
  lng1 *= Math.PI / 180;
  lat2 *= Math.PI / 180;
  lng2 *= Math.PI / 180;
  return 1000 * 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
}
// 取得しているトリガーをGPS単独で絞り込む
// さらに過去のトリガー履歴を参照し認識間隔が条件を満たす
function GPSfilterTrigger(trigger){
    // trueを返す→有効なtrigger、falseを返す→無効なtrigger
	if(trigger.type == 'GPS'){
        const triggerId = trigger['id'];
		const triggerFrom = new Date(trigger.dateFrom);
		const triggerTo = new Date(trigger.dateTo);
		const now = new Date();
		if(triggerFrom > now || now > triggerTo){
			return false;
		}
		// 最後のトリガー履歴をチェック →無いなら有効なtrigger
		const triggerHistory = getStorage('lastTriggerHistory');
        if(!triggerHistory[triggerId]){
            return true;
        }
        else{
            // 一日一回、期間中一回
            if(trigger['interval'] == 'day' || trigger['interval'] == 'once'){
                if(trigger['interval'] == 'day'){
                    const now = new Date();
                    const nowStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' +  now.getDate()).slice(-2);
                    const histDate =  new Date(triggerHistory[triggerId]['date']);
                    const histDateStr = histDate.getFullYear() + '/' + ('0' + (histDate.getMonth() + 1)).slice(-2) + '/' + ('0' +  histDate.getDate()).slice(-2);
                    // 最後のトリガーの年月日　<= 現在年月日→有効なtrigger
                    return histDateStr <= nowStr;
                }
                else if(trigger['interval'] == 'once'){
                    // 期間中一度だけ→無効なトリガー
                    return false;
                }
            }
            else{
                // 指定の間隔
                const lastDate = new Date(triggerHistory[triggerId]['date']);
                const addMinuts = trigger.interval.split(':')[0] * 1;
                const addSeconds = trigger.interval.split(':')[1] * 1;
                lastDate.setMinutes(lastDate.getMinutes() + addMinuts);
                lastDate.setSeconds(lastDate.getSeconds() + addSeconds);
                return new Date() >= lastDate ? true : false;
            }
        }
	}
	else{
		return false;
	}
}

// トリガー履歴を登録する
function insertTriggerHistory(trigger){
	const now = (new Date()).getTime();
	//const nowStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' +  now.getDate()).slice(-2) + '' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2);
    
    const triggerHistory = getStorage('lastTriggerHistory');
    triggerHistory[trigger['id']] = {date: now};
    setStorage('lastTriggerHistory', triggerHistory);
    const insert = db.triggerHistories.add({
        triggerId: trigger['id'],
        date: now
    });        
	
	return insert;
}
// ポイント付与を確認する
function checkPointHistory(trigger){
    const triggerId = trigger['id'];
	const pointHistory = getStorage('lastPointHistory');
    
    if(!pointHistory[triggerId]){
        return true;
    }
	// 一日一回、期間中一回
	else{
        if(trigger.pointInterval == 'day' || trigger.pointInterval == 'once'){
            if(trigger['pointInterval'] == 'day'){
                // 今日ポイント付与していたらデータを返す→履歴が1件以上→付与しない
                const now = new Date();
                const nowStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' +  now.getDate()).slice(-2);
                const histDate =  new Date(pointHistory[triggerId]['date']);
                const histDateStr =  histDate.getFullYear() + '/' + ('0' + (histDate.getMonth() + 1)).slice(-2) + '/' + ('0' +  histDate.getDate()).slice(-2);
                return histDateStr < nowStr;
            }
            else if(trigger['pointInterval'] == 'once'){
                return false;
            }
        }
        // 毎回付与
        else{
            return true;            
        }
	}
}
// ポイント履歴を登録する
function insertPointHistory(trigger){
	const now = (new Date()).getTime();
    
    const pointHistory = getStorage('lastPointHistory');
    pointHistory[trigger['id']] = {date: now};
	setStorage('lastPointHistory', pointHistory);    
    updatePoint(trigger['point']);
    const insert = db.pointHistories.add({
        triggerId: trigger['id'],
        date: now,
        point: trigger['point']
    });        
    return insert;
}

function TimerfilterTrigger(trigger){
	if(trigger.type == 'TIMER'){
        const triggerId = trigger['id'];
		const triggerFrom = new Date(trigger.dateFrom);
		const triggerTo = new Date(trigger.dateTo);
		const now = new Date();
		if(triggerFrom > now || now > triggerTo){
			return false;
		}
		// 最後のトリガー履歴をチェック →無いなら有効なtrigger
		const triggerHistory = getStorage('lastTriggerHistory');
        if(!triggerHistory[triggerId]){
            return true;
        }
        else{
            // 一日一回、期間中一回
            if(trigger['interval'] == 'day' || trigger['interval'] == 'once'){
                if(trigger['interval'] == 'day'){
                    const now = new Date();
                    const nowStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' +  now.getDate()).slice(-2);
                    const histDate =  new Date(triggerHistory[triggerId]['date']);
                    const histDateStr = histDate.getFullYear() + '/' + ('0' + (histDate.getMonth() + 1)).slice(-2) + '/' + ('0' +  histDate.getDate()).slice(-2);
                    // 最後のトリガーの年月日　<= 現在年月日→有効なtrigger
                    return histDateStr < nowStr;
                }
                else if(trigger['interval'] == 'once'){
                    // 期間中一度だけ→無効なトリガー
                    return false;
                }
            }
            else{
                // 指定の間隔
                const lastDate = new Date(triggerHistory[triggerId]['date']);
                const addMinuts = trigger.interval.split(':')[0] * 1;
                const addSeconds = trigger.interval.split(':')[1] * 1;
                lastDate.setMinutes(lastDate.getMinutes() + addMinuts);
                lastDate.setSeconds(lastDate.getSeconds() + addSeconds);
                return new Date() >= lastDate ? true : false;
            }
        }
	}
	else{
		return false;
	}
}
function getTriggerInfoById(triggerId){
    let triggers = getStorage('triggers');
    triggers = triggers.filter(function(trigger){
        return trigger['id'] == triggerId;
    });
    return triggers[0];
}
function getQueryString(){
    const result = {};
    if(1 < window.location.search.length)
    {
        const query = window.location.search.substring(1);

        const parameters = query.split('&');

        for(let i = 0; i < parameters.length; i++)
        {
            const element = parameters[ i ].split('=');

            const paramName = decodeURIComponent(element[0]);
            const paramValue = decodeURIComponent(element[1]);

            result[paramName] = paramValue;
        }
    }
    return result;
}
function QRfilterTrigger(trigger){
	if(trigger.type == 'QR' || trigger.type == 'QR AND GPS'){
        const triggerId = trigger['id'];
		const triggerFrom = new Date(trigger.dateFrom);
		const triggerTo = new Date(trigger.dateTo);
		const now = new Date();
		if(triggerFrom > now || now > triggerTo){
			return false;
		}
		// 最後のトリガー履歴をチェック →無いなら有効なtrigger
		const triggerHistory = getStorage('lastTriggerHistory');
        if(!triggerHistory[triggerId]){
            return true;
        }
        else{
            // 一日一回、期間中一回
            if(trigger['interval'] == 'day' || trigger['interval'] == 'once'){
                if(trigger['interval'] == 'day'){
                    const now = new Date();
                    const nowStr = now.getFullYear() + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + ('0' +  now.getDate()).slice(-2);
                    const histDate =  new Date(triggerHistory[triggerId]['date']);
                    const histDateStr = histDate.getFullYear() + '/' + ('0' + (histDate.getMonth() + 1)).slice(-2) + '/' + ('0' +  histDate.getDate()).slice(-2);
                    // 最後のトリガーの年月日　<= 現在年月日→有効なtrigger
                    return histDateStr < nowStr;
                }
                else if(trigger['interval'] == 'once'){
                    // 期間中一度だけ→無効なトリガー
                    return false;
                }
            }
            else{
                // 指定の間隔
                const lastDate = new Date(triggerHistory[triggerId]['date']);
                const addMinuts = trigger.interval.split(':')[0] * 1;
                const addSeconds = trigger.interval.split(':')[1] * 1;
                lastDate.setMinutes(lastDate.getMinutes() + addMinuts);
                lastDate.setSeconds(lastDate.getSeconds() + addSeconds);
                return new Date() >= lastDate ? true : false;
            }
        }
	}
	else{
		return false;
	}
}
function backPage(){
	history.go(-1);
}
function forwardPage(){
	history.go(1);
}
function redirectQRpageAndScan(){
	window.location.href = 'qrplus.html?qrreader';
}
function soundPointGet(audioId){
	document.getElementById(audioId).muted = false;
	document.getElementById(audioId).play();
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
function reloadPage(){
	window.location.reload();
}