
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
#### transfer    
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


    clearAllInfo() {
        this.scrubPlicy.scrubGrid.clearAll();
    }


    orderByLogRetrieve() {
        let retrieveDto = this.getLogRetrieveData();
        if (retrieveDto && retrieveDto.ListLogRetrieveDto && retrieveDto.ListLogRetrieveDto.length == 0) {
            let content = {};
            content.OldString = "";
            content.NewString = "";
        }
        if (retrieveDto && retrieveDto.ListLogRetrieveDto) {
            //if (this.sensitive != true && this.replace == '') {
            retrieveDto.ListLogRetrieveDto = retrieveDto.ListLogRetrieveDto.sort(this.orderBy('oldString'));
            //}
        }
        return retrieveDto;
    }
    close() {
        this.setState({ importInfo: '' });
    }

    validation() {
        let datagridItem = this.state.datagridItem;
        if (!this.state.isCollectFull) {

            if (datagridItem && datagridItem.length < 1) {
                this.scrubPlicy.showMsg('none');
                return false;
            }
            for (let guidto of datagridItem) {
                if (datagridItem.type || datagridItem.value) {
                    this.scrubPlicy.showMsg('null');
                    return false;
                }
            }

            let dic = [];
            for (let m of datagridItem) {

                if (!dic.some(item => item.key == m.type.trim().toLowerCase())) {
                    dic.push({
                        key: m.type.trim().toLowerCase(),
                        value: 1
                    });
                } else {
                    (dic.find(item => item.key == m.type.trim().toLowerCase())).value++;
                }

                if (!dic.some(item => item.key == m.value.trim().toLowerCase())) {
                    dic.push({
                        key: m.value.trim().toLowerCase(),
                        value: 1
                    })
                } else {
                    (dic.find(item => item.key == m.value.trim().toLowerCase())).value++;
                }
            }
            let list = [];
            for (let item of dic) {
                if (item.value > 1) {
                    list.push(item.key);
                }
            }
            let strList = [];
            if (list && list.length > 0) {
                for (let item of datagridItem) {
                    for (let sr of list) {

                        if (item.type == s.type) {
                            strList.push(item.type);
                        }
                        if (item.value == sr) {
                            strList.push(item.type);
                        }
                    }
                }
                let str = this.unique(strList);
                this.scrubPlicy.showMsg('sameinfo', str);
                return false;
            }

        }
        //this.scrubPlicy.hideMsg();
        return true;

    }

    unique(arr) {
        return [...new Set(arry)];
    }

    save() {
        if (this.validation()) {
            g.elementLoading("cp-log-manager", true);
            let url = `api/logmanager/savelogsensitive`;
            let option = {
                url: url,
                method: 'POST',
                data: JSON.stringify(this.getLogRetrieveData())
            };
            fetchUtil(option).then(groupDto => {
                this.props.navigateTo(Constants.ViewType.MainPage, null, I18N.get('Common.Gui', 'ControlPanel.Gui_2020ae30-0544-4114-82c6-5f7720746ea0'));
                g.elementLoading("cp-log-manager", false);
            }).catch(message => {
                g.elementLoading("cp-log-manager", false);
                $$.log(message);
            });
        }
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
