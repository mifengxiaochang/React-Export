
import React from 'react';
import ReactDOM from 'react-dom';

const eventArg = [
    "exportSetting"
];
class Download extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            importInfo: ''
        }
        this.setBind();
       
    }
    setBind() {
        for (let event of eventArg) {
            this[event] = this[event].bind(this);
        }
    }
    
    export const DownLoadMsg = (sMsg) => {
    //let sensitiveMsg = JSON.stringify(sensitiveMsg);
    
    let options = {
        url: 'downloadsensitivity',
        method: 'POST',
        credentials: 'same-origin',
        data: JSON.stringify(sMsg)
    };
    
    return fetchUtil(options);
}
    window.fetchUtil = function (options, errorFun) {
    if (getSecurityMode() == "0") {
        let request = encrypt(options.data);
        options.data = request;
    }

    let request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: options.data
    };
    if (options.method)
        request.method = options.method;
    if (options.cache)
        request.cache = options.cache;

    return fetch(options.url, request)
        .then(function (response) {
            if (response.ok) {
                return response.text();
            } else {
                if (response.status == 401) {
                    g.loading(false);
                    g.alert(true, {
                        title: "warn",
                        content: "time out,please again",
						backdropColor: "#ddd",
                        type: 'i',
                        clickY: () => { location.href = "Login.aspx?status=1"; }
                    });
                } else if (response.status == 400) {
                    g.loading(false);                 
                }

                if (errorFun)
                    errorFun(response);
                else
                    throw new Error(response.statusText);
            }
        }).then(function (dataStr) {
            if (dataStr == null || dataStr == '')
                return null;

            if (getSecurityMode() == "0") {
                dataStr = decryptResponse(dataStr);
            }

            return JSON.parse(dataStr);
        });
}


    exportSetting(e) {        
        let sensitiveMsg = this.orderByLogRetrieve();//接收需要下载的数据
        Service.DownLoadMsg(sMsg)
            .then(
            (result) => {

                if (!result) {
                    throw ("error");
                }

                this.export_raw('1', result)
            }
            ).catch((e) => {
                $$.error(`error: ${e}`);
            });
    }
    export_raw(name = '', data) {
        let eleLink = document.createElement('a');
        eleLink.style.display = 'none';
        eleLink.download = name ？name + '.xls': 'download.xls';
        data = "data:;base64," + data;
        if (window.navigator.msSaveOrOpenBlob) { // if browser is IE            
            let blob = this.dataURLtoBlob(data);
            navigator.msSaveOrOpenBlob(blob, 'download.xls');
        } else {
            eleLink.href = data;
            document.body.appendChild(eleLink);
            eleLink.click();
            document.body.removeChild(eleLink);

        }

    }
/**** transfer  ****/
    dataURLtoBlob = (dataurl) => {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }


    fake_click = (obj) => {
        var ev = document.createEvent("MouseEvents");
        ev.initMouseEvent(
            "click", true, false, window, 0, 0, 0, 0, 0
            , false, false, false, false, 0, null
        );
        obj.dispatchEvent(ev);
    }


    unique(arr) {   //数据去重
        return [...new Set(arry)];
    }


    render() {
       
        return (
            <div id="download">
                <input type="button" ref={(el) => { this.fileUpload = el }} onChange={this.exportSetting} />
            </div>
        )
    }
}

export default Download;
