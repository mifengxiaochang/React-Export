

    public class LogManagerStubServices 
    {
        private static AveLogger logger = AveLogger.GetInstance(MethodBase.GetCurrentMethod().DeclaringType);
        
        public byte[] DownLoadSensitivityMsg(LogRetrieveForGuiDto sensitiveMsg)
        {
            string fullPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Stream str = GetDownloadStream(sensitiveMsg, fullPath);
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
        private Stream GetDownloadStream(LogRetrieveForGuiDto dic, string fullPath)
        {
            LogManagerScrubDownloadXLS downloader = new LogManagerScrubDownloadXLS();
            int count = dic.ListLogRetrieveDto.Count;
            var content = new string[2][];
            content[0] = new string[count + 1];
            content[1] = new string[count + 1];
            content[0][0] = "Category";
            content[1][0] = "Title";
            int x = 0;
            foreach (var s in dic.ListLogRetrieveDto)
            {
                content[0][x + 1] = s.OldString;
                content[1][x + 1] = s.NewString;
                x++;
            }
            downloader.Create("Sensitive Information", content, fullPath);
            try
            {
                return File.OpenRead(fullPath);
            }
            catch (Exception e)
            {
                logger.Error("Log Scrub : Open file error.", e);
                throw;
            }
        }
       
       
    }
   
}
