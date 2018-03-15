# React-Export
## 后台将内容整合返回byte[]
      public byte[] DownLoadMsg(LogRetrieveForDto sMsg)
        {
            string fullPath = Path.Combine(Path.GetTempPath(), "0000-0000-0000");
            Stream str = GetDownloadStream(sMsg, fullPath);
            var bytes = new byte[str.Length];
            try
            {
                str.Read(bytes, 0, bytes.Length);
                // 设置当前流的位置为流的开始 
                str.Seek(0, SeekOrigin.Begin);
                return bytes;
            }
            catch (Exception e)
            {
                logger.Error("Log Scrub : read file error.", e);
                throw;
            }
            finally
            {
                str.Close();
                str.Dispose();
                File.Delete(fullPath);
            }
        }
      
## 前台接收byte[]数据，进行对应下载
      export_raw(name = '', data) {
          let eleLink = document.createElement('a');
          eleLink.style.display = 'none';
          eleLink.download =name?name: 'download.xls';
          data = "data:;base64," + data;
          if (window.navigator.msSaveOrOpenBlob) {// if browser is IE              
              let blob = this.dataURLtoBlob(data); 
              navigator.msSaveOrOpenBlob(blob, 'download.xls');
          } else {
              eleLink.href = data;
              document.body.appendChild(eleLink);
              eleLink.click();
              document.body.removeChild(eleLink);

          }

      }
      
* 用fetch向后台请求数据，后台返回一个文件流实现导出Excel表
```
  .then(response => response.blob())
        .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = "filename.xlsx";
            a.click();                    
        });
   ```
   
