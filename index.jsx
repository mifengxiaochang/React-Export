/*Covered by AvePoint copyright and license agreement*/
import React from 'react';
import ReactDOM from 'react-dom';
import { FormSectionLayout, FuncDescriptionPanel, ButtonsComponent, ValidationPanel } from '$d';
import FormLayout from '../../../Components/Layouts/FormLayout';
import * as Constants from '../Constants';
import RibbonButton from './Componet/RibbonButton';
import ScrubPlicy from './Componet/ScrubPlicy';
import { SensitiveType } from '../../../../Constants/Constants';
import * as LogScrubService from './LogScrubService'
import * as utility from '$d';
import { MessageBar } from '$d';
const eventArg = [
    "closeTab",
    "handleValue",
    "cancel",
    "save",
    "valueCallBack",
    "retrieveData",
    "validation",
    "exportSetting",
    "readFileContent",
    "importFile",
    "importSetting",
    "close"
];
class LogScrub extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isCollectFull: true,
            datagridItem: [],
            showImportMsg: false,
            importInfo: ''
        }

        this.newString = '';
        this.setBind();
        this.mappingButtons = [
            { buttonName: I18N.get('Common.Gui', 'Gui.Common_Save'), buttonClick: this.save },
            { buttonName: I18N.get('Common.Gui', 'Gui.Common_Cancel'), buttonClick: this.cancel, isLink: true },
        ];
    }

    componentDidMount() {
        setCPBreadcrumbs([I18N.get("Common.Gui", "ControlPanel.Gui_Log Manager"), I18N.get("Common.Gui", "ControlPanel.Gui_2264f64d-46b9-48d1-9297-0dce267f8aa0")]);
        this.initPageData();
    };

    setBind() {
        for (let event of eventArg) {
            this[event] = this[event].bind(this);
        }
    }
    closeTab() {
        this.props.navigateTo(Constants.ViewType.MainPage);
    }
    handleValue(e) {

        this.setState({
            [e.target.name]: !!(e.target.value == 'yes')
        })
    }
    retrieveData() {
        g.elementLoading("cp-log-manager", true);
        let url = `api/logmanager/loadLogdata`;
        let option = {
            url: url,
            method: 'GET',
        };
        fetchUtil(option).then(securityData => {
            let allSecurityDatadto = this.getLogRetrieveData();
            if (allSecurityDatadto && allSecurityDatadto.ListLogRetrieveDto && allSecurityDatadto.ListLogRetrieveDto.length > 0) {

                for (let i = 0, len = allSecurityDatadto.ListLogRetrieveDto.length; i < len; i++) {

                    let allSecurityData = allSecurityDatadto.ListLogRetrieveDto[i];
                    if (securityData && securityData.length > 0) {
                        for (let j = 0; j < securityData.length; j++) {
                            let logRetrieveDto = securityData[j];
                            if (allSecurityData.oldString.toLowerCase() == logRetrieveDto.oldString.toLowerCase()) {
                                securityData.splice(j, 1);
                                j--;
                            }
                        }
                    }
                }
                if (securityData && securityData.length > 0) {
                    for (let i = 0, len = securityData.length; i < len; i++) {
                        securityData[i].newString = this.getNewString(securityData[i].type, allSecurityDatadto.ListLogRetrieveDto, 0);
                        allSecurityDatadto.ListLogRetrieveDto.push(securityData[i]);
                    }
                }

            } else {
                if (securityData && securityData.length > 0) {
                    allSecurityDatadto.ListLogRetrieveDto = [];
                    for (let logDto of securityData) {
                        logDto.newString = this.getNewString(logDto.type, allSecurityDatadto.ListLogRetrieveDto, 0);
                        allSecurityDatadto.ListLogRetrieveDto.push(logDto);
                    }
                }

            }
            let retrieveDto = {};
            retrieveDto.listLogRetrieveDto = allSecurityDatadto.ListLogRetrieveDto;
            retrieveDto.listLogRetrieveDto = retrieveDto.listLogRetrieveDto.sort(this.orderBy('oldString'));

            this.scrubPlicy.scrubGrid.scrubList(retrieveDto.listLogRetrieveDto, true);

            g.elementLoading("cp-log-manager", false);
        }).catch(message => {
            g.elementLoading("cp-log-manager", false);
            $$.log(message);
        })
    }

    initPageData() {
        g.elementLoading("cp-log-manager", true);
        LogScrubService.GetAllSensitiveData().then(
            (result) => {
                if (result) {
                    let isCollectFull;
                    if (result.isCollectScrubLogs) {
                        this.setState({ isCollectFull: false });
                        if (result.listLogRetrieveDto && result.listLogRetrieveDto.length > 0) {
                            this.scrubPlicy.scrubGrid.scrubList(result.listLogRetrieveDto);
                            // ScrubList(result.ListLogRetrieveDto);
                        }
                    }
                }
                g.elementLoading("cp-log-manager", false);
            }
        ).catch((e) => {
            $$.log(e);
        });
    }

    orderBy(property, byDesc = false) {

        return (pre, next) => {
            let p = pre[property],
                n = next[property];
            if (!isNaN(Number(p)) && !isNaN(Number(n))) {
                p = Number(p);
                n = Number(n);
                if (p === n) {
                    return 0;
                } else {
                    return byDesc ? (p > n ? -1 : 1) : (p > n ? 1 : -1);
                }
            } else {
                return byDesc ? n.localeCompare(p) : p.localeCompare(n);
            }
            //if (isNaN(p)) {                 
            //} else {
            //    if (p === n) {
            //        return 0;
            //    } else {
            //        return p > n ? 1 : -1;
            //    }
            //}
        };
    }

    getNewString(type, listLogRetrieveDtos, i) {

        let newString = '';
        switch (type) {
            case SensitiveType.Host:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_df0c0ffb-486d-4b27-a745-bdde916418b4', i);
                break;
            case SensitiveType.Ip:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_0349b638-df24-44ac-bb01-1c8714ca264b', i);
                break;
            case SensitiveType.IpOrHost:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_79cb3b9e-f5ab-4c73-a709-9a25f19f8fc9', i);
                break;
            case SensitiveType.Port:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_d6a50ec5-c803-407d-9155-5aefc0a18a95', i);
                break;
            case SensitiveType.UncPath:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_3f386a38-8d43-4aca-9508-ddd0b3429d76', i);
                break;
            case SensitiveType.Url:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_682bced4-91a5-4bba-b03f-8ca6f943b70b', i);
                break;
            case SensitiveType.UserName:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_ee560406-0e24-4b5b-a4ab-2ee62c0873eb', i);
                break;
            case SensitiveType.DataBaseName:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_7b3ca495-ca15-4484-ae2d-6db70c6cd3cc', i);
                break;
            case SensitiveType.HostHeader:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_f20660c1-93f6-40ea-96b7-c21a2b39dac5', i);
                break;
            case SensitiveType.DomainName:
                newString = I18N.get('Common.Gui', 'ControlPanel.Gui_9f27b489-e48c-449e-bbbc-862cebeb7d46', i);
                break;
        }
        for (let r of listLogRetrieveDtos) {

            if (r.newString.toLowerCase() == newString.toLowerCase() || r.oldString.toLowerCase() == newString.toLowerCase()) {
                return this.getNewString(type, listLogRetrieveDtos, ++i);
            }
        }
        return newString;
    }

    cancel() {
        this.props.navigateTo(Constants.ViewType.MainPage);
    };

    getLogRetrieveData() {
        let dto = {};
        dto.IsCollectFullLogs = this.state.isCollectFull;
        dto.IsCollectScrubLogs = !this.state.isCollectFull;
        dto.ListLogRetrieveDto = [];
        if (dto.IsCollectFullLogs) {
            return dto;
        }
        let allMessage = this.state.datagridItem;
        for (let i = 0, len = allMessage.length; i < len; i++) {
            dto.ListLogRetrieveDto.push({ oldString: allMessage[i].type.trim(), newString: allMessage[i].value.trim() });
        }
        return dto;
    }

    valueCallBack(state, newState) {
        if (state = 'datagridItem') {
            newState = this.convertDtoToController(newState);
        }
        this.setState({
            [state]: newState
        });
    };
    convertDtoToController(datagridItem) {
        let dto = [];
        if (datagridItem && datagridItem.length > 0) {
            for (let item of datagridItem) {
                dto.push({
                    isSelected: item.isChecked,
                    type: item.sensitive.trim(),
                    value: item.replace.trim()
                })
            }
        }
        return dto;
    };

    exportSetting(e) {
        //if (document.execCommand("SaveAs")) {
        //    return false;
        //}

        let sensitiveMsg = this.orderByLogRetrieve();//将Export的数据进行排序，达到和GUI上相同的顺序。
        LogScrubService.DownLoadSensitivityMsg(sensitiveMsg)
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

    importSetting() {
        $$.toolkit_confirm("show", {
            title: "DocAve",
            content: I18N.get("Common.Gui", "ControlPanel.Gui_9e675356-6e2c-4f2b-8756-db08096b3bad"),
            clickY: () => {
                this.importFile();
            }

        });
    }

    importFile() {
        g.elementLoading("cp-log-manager", true);
        this.fileUpload.click();
        g.elementLoading("cp-log-manager", false);
    }

    readFileContent(e) {
        let _self = this,
            file = e.target.files[0];
        if (file) {
            g.elementLoading("cp-log-manager", true);
            let folderName = file.name; //+ Guid.NewGuid().ToString();
            utility.uploadFile(file, folderName, true, () => {

                let fileType = '', buffer;
                if (file) {
                    let reader = new FileReader();
                    reader.onerror = () => {
                        $$.toolkit_alert("show",
                            {
                                type: "e",
                                content: I18N.get("Common.Gui", "ControlPanel.Gui_b67aa7f5-b452-47e2-a8ff-5079286d8497"),
                            }
                        );
                    };
                    reader.onload = (e) => {
                        buffer = e.target.result;

                        let fileData = new Uint8Array(buffer);

                        fileType = _self.getFileType(folderName);
                        this.importFileToController(fileData, fileType);
                    };
                    reader.readAsArrayBuffer(file);

                }

            });
        };
    };

    importFileToController(buffer, fileType) {
        if (buffer) {
            let dto = {
                fileData: buffer,
                fileType: fileType
            }

            let url = `api/logmanager/uploadsensitivemsgtogui`;
            let option = {
                url: url,
                method: 'POST',
                data: JSON.stringify(dto)
            };

            fetchUtil(option).then(result => {

                if (result) {

                    if (result.listLogRetrieveDto == null || result.listLogRetrieveDto.length <= 0) {
                        $$.toolkit_alert("show",
                            {
                                type: "e",
                                content: I18N.get("Common.Gui", "ControlPanel.Gui_14bf0d64-f3e3-4885-bb11-d9fa05146ea8"),
                            }
                        );
                        return;
                    }
                    this.clearAllInfo();
                    let datagridItem = [];

                    this.scrubPlicy.scrubGrid.scrubList(result.listLogRetrieveDto);
                    this.setState({
                        type: 'd',
                        importInfo: I18N.get('Common.Gui', 'ControlPanel.Gui_df616cea-f6aa-4d19-8faa-ab6273b88b73')
                    })
                }

            }).catch(message => {
                $$.toolkit_alert("show",
                    {
                        type: "e",
                        content: I18N.get("Common.Gui", "ControlPanel.Gui_aae603ea-abdb-4d4b-9dd8-d9a555517fe8"),
                    }
                );
                $$.log(message);
            });

        }
        g.elementLoading("cp-log-manager", false);
    }


    getFileType(fileName) {
        if (fileName == void 0 || fileName == null) return;
        let index = fileName.lastIndexOf('.');
        return fileName.substring(index, fileName.length);
    };

    export_raw(name = '', data) {
        let eleLink = document.createElement('a');
        eleLink.style.display = 'none';
        eleLink.download = 'LogScrubPolicy.xls';
        data = "data:;base64," + data;
        if (window.navigator.msSaveOrOpenBlob) {
            // if browser is IE 
            let blob = this.dataURLtoBlob(data);
            navigator.msSaveOrOpenBlob(blob, 'LogScrubPolicy.xls');
        } else {
            eleLink.href = data;
            document.body.appendChild(eleLink);
            eleLink.click();
            document.body.removeChild(eleLink);

        }

    }
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
        let description = I18N.get('Common.Gui', 'ControlPanel.Gui_97aae944-a80d-45e7-a1a0-81e2746e8c91'),
            scrublog = I18N.get('Common.Gui', 'ControlPanel.Gui_e22cd1f1-8c7b-4b24-bf22-142d1e373a14'),
            fulllog = I18N.get('Common.Gui', 'ControlPanel.Gui_43e0f287-8d9a-430f-ae02-7b270822ad74');
        return (
            <div id="logscrub">
                <input type="file" hidden ref={(el) => { this.fileUpload = el }} onChange={this.readFileContent} name="file" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />

                <RibbonButton
                    isDisabled={this.state.isCollectFull}
                    cancelClick={this.closeTab}
                    retrieveData={this.retrieveData}
                    saveClick={this.save}
                    exportClick={this.exportSetting}
                    importClick={this.importSetting}
                />
                <MessageBar
                    status={{
                        type: this.state.type,
                        isShow: this.state.importInfo,
                        string: this.state.importInfo,
                    }}
                    close={this.close}
                />

                <FuncDescriptionPanel imagePath='img-cp-logmanager-log-scub'>
                    <FuncDescriptionPanel.Description>
                        {description}
                    </FuncDescriptionPanel.Description>
                </FuncDescriptionPanel>
                <FormLayout>
                    <FormSectionLayout>
                        <FormSectionLayout.Description
                            title="ControlPanel.Gui_09665e8d-9830-4168-b947-6e5e8bfe0704"
                            description='ControlPanel.Gui_1a6b9abf-8259-4d01-9117-83365c510de9'
                        />
                        <FormSectionLayout.Content>
                            <div className="collect-log" >
                                <label><input name="isCollectFull" type="radio" onChange={this.handleValue} checked={this.state.isCollectFull} value="yes" /><span>{fulllog}</span></label>
                            </div>
                            <div className="collect-log">
                                <label><input name="isCollectFull" type="radio" onChange={this.handleValue} checked={!this.state.isCollectFull} value="no" /><span>{scrublog}</span></label>
                            </div>
                        </FormSectionLayout.Content>
                    </FormSectionLayout>
                    {
                        this.state.isCollectFull ? '' :
                            (<ScrubPlicy
                                ref={(node) => { this.scrubPlicy = node }}
                                datagridItem={this.state.datagridItem}
                                valueCallBack={this.valueCallBack}
                                retrieveData={this.retrieveData}
                            />)
                    }
                </FormLayout>
                <ButtonsComponent mappingButtons={this.mappingButtons} />
            </div>
        )
    }
}

export default LogScrub;