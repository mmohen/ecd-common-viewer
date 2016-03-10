/**
 * Downloader worker thread
 */

function getPdf(primaryUrl, fallBack, pageRange) {

    if (!primaryUrl) {
        return;
    }

    log('Started Downloading: ' + primaryUrl , pageRange);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', primaryUrl);

    xhr.mozResponseType = xhr.responseType = 'arraybuffer';

    xhr.onprogress = function progress(evt) {
        self.postMessage({
            response:'downloadProgress',
            loaded:evt.loaded,
            pageRange:pageRange,
            total:evt.lengthComputable ? evt.total : void(0)
        });
    };

    xhr.onerror = function error(e) {
        self.postMessage({response:'downloadError', pageRange:pageRange, error:'Unexpected server response of ' + e.target.status + '. for url:' + primaryUrl});
        if (fallBack) {
            log("Trying to download fallback: " + fallBack, pageRange);
            getPdf(fallBack, "", pageRange);
        }  else{
            self.close();
        }
    };

    xhr.onreadystatechange = function getPdfOnreadystatechange(e) {
        //request finished and response is ready
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = (xhr.mozResponseArrayBuffer || xhr.mozResponse ||
                    xhr.responseArrayBuffer || xhr.response);
                returnData(data, pageRange);
            } else {
                self.postMessage({response:'downloadError', pageRange:pageRange, error:'Unexpected server response of ' + e.target.status + '. for url:' + primaryUrl});
                if (fallBack) {
                    log("Trying to download fallback: " + fallBack, pageRange);
                    getPdf(fallBack, "", pageRange);
                }else{
                    self.close();
                }
            }
        }
    };
    xhr.send(null);
}



function returnData(data, pageRange) {
    self.postMessage({response:'docDownloaded', pageRange:pageRange, content:data});
    self.close();
}

function log(msg, pageRange) {
    self.postMessage({response:'log', pageRange:pageRange, msg:msg});
}

self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.action) {
        case 'download':
            getPdf(data.primaryUrl, data.fallbackUrl, data.pageRange);
            break;
        default:
//            self.postMessage('Unknown action: ' + data.action);
    }
}, false);
