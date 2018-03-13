    public class DownloadServices 
    {
        
        public byte[] DownLoadMsg(LogRetrieveForGuiDto sensitiveMsg)
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
            ScrubDownloadXLS downloader = new ScrubDownloadXLS();
            int count = dic.ListLogRetrieveDto.Count;
            var content = new string[2][];
            content[0] = new string[count + 1];
            content[1] = new string[count + 1];
            content[0][0] = "Category";
            content[1][0] = "Title";
            int x = 0;
           
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
      private Stream GetDownloadStream(LogRetrieveForGuiDto dic, string fullPath)
        {
            LogManagerScrubDownloadXLS downloader = new LogManagerScrubDownloadXLS();
            int count = dic.ListLogRetrieveDto.Count;
            var content = new string[2][];
            content[0] = new string[count + 1];
            content[1] = new string[count + 1];
           
            int x = 0;
          
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
        public class ScrubDownloadXLS : IDisposable
        {
        /// <summary>
        /// Xls宽度单位的倍率
        /// </summary>
        private const int mDynameter = 200;
        private HSSFWorkbook book = null;
        private HSSFSheet sheet = null;
        private FileStream file = null;
        private static AveLogger logger = AveLogger.GetInstance(MethodBase.GetCurrentMethod().DeclaringType);

        public void Create(string sheetName, string[][] content, string fullPath)
        {
            try
            {
                book = new HSSFWorkbook();
                sheet = book.CreateSheet(sheetName) as HSSFSheet;
                for (int i = 0; i < content.Count(); i++)
                {
                    if (content[i].Any())
                    {
                        AddTitle(sheet, i, content[i][0]);
                    }
                    if (content[i].Count() > 1)
                    {
                        AddColumnContent(sheet, i, content[i].Skip(1).ToList<string>());
                    }
                }
                file = new FileStream(fullPath, FileMode.OpenOrCreate);
                book.Write(file);
            }
            catch (Exception e)
            {
                logger.Error(e.Message, e);
                throw;
            }
            finally
            {
                if (file != null)
                {
                    file.Flush();
                    file.Close();
                }
                if (sheet != null) sheet.Dispose();
                if (book != null) book.Dispose();
            }
        }

        private void AddColumnContent(HSSFSheet sheet, int col, List<string> contents)
        {
            for (int i = 0; i < contents.Count; i++)
            {
                HSSFRow row;
                if (sheet.LastRowNum < i + 1)
                {
                    row = sheet.CreateRow(i + 1) as HSSFRow;
                }
                else
                {
                    row = sheet.GetRow(i + 1) as HSSFRow;
                }
                HSSFCell cell = row.CreateCell(col) as HSSFCell;
                cell.SetCellValue(new HSSFRichTextString(contents[i]));
            }
        }

        private void AddTitle(HSSFSheet sheet, int col, string content)
        {
            HSSFRow row = col == 0 ? sheet.CreateRow(0) as HSSFRow : sheet.GetRow(0) as HSSFRow;
            HSSFCell cell = row.CreateCell(col) as HSSFCell;
            cell.SetCellValue(new HSSFRichTextString(content));
            CellStyle style = sheet.Workbook.CreateCellStyle();
            Font font = sheet.Workbook.CreateFont();
            font.Color = HSSFColor.LIGHT_BLUE.index;
            font.Boldweight = (short)700;
            style.Alignment = HorizontalAlignment.CENTER;
            style.FillBackgroundColor = HSSFColor.GREY_25_PERCENT.index;
            style.FillForegroundColor = HSSFColor.GREY_25_PERCENT.index;
            style.FillPattern = FillPatternType.SOLID_FOREGROUND;
            style.SetFont(font);
            cell.CellStyle = style;
            sheet.SetColumnWidth(col, mDynameter * 70);
        }

        public void Dispose()
        {
            book = null;
            sheet = null;
            file = null;
        }
    }
