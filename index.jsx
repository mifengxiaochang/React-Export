
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
