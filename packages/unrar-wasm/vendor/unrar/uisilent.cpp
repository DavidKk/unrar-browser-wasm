// Purely user interface function. Gets and returns user input.
UIASKREP_RESULT uiAskReplace(std::wstring &Name,int64 FileSize,RarTime *FileTime,uint Flags)
{
  return UIASKREP_R_REPLACE;
}




void uiStartArchiveExtract(bool Extract,const std::wstring &ArcName)
{
}


bool uiStartFileExtract(const std::wstring &FileName,bool Extract,bool Test,bool Skip)
{
  return true;
}


void uiExtractProgress(int64 CurFileSize,int64 TotalFileSize,int64 CurSize,int64 TotalSize)
{
}


void uiProcessProgress(const char *Command,int64 CurSize,int64 TotalSize)
{
}


void uiMsgStore::Msg()
{
}


// 外部声明的全局密码（在 unrar.cpp 中定义）
extern char globalPassword[256];

bool uiGetPassword(UIPASSWORD_TYPE Type,const std::wstring &FileName,
                   SecPassword *Password,CheckPassword *CheckPwd)
{
  // 如果全局密码已设置,使用它
  if (globalPassword[0] != '\0') {
    // 将 char* 转换为 wchar_t*
    std::wstring wpassword;
    for (int i = 0; globalPassword[i] != '\0'; i++) {
      wpassword += (wchar_t)globalPassword[i];
    }
    Password->Set(wpassword.c_str());
    return true;
  }
  return false;
}


bool uiIsGlobalPasswordSet()
{
  return globalPassword[0] != '\0';
}


void uiAlarm(UIALARM_TYPE Type)
{
}


bool uiIsAborted()
{
  return false;
}


void uiGiveTick()
{
}


bool uiDictLimit(CommandData *Cmd,const std::wstring &FileName,uint64 DictSize,uint64 MaxDictSize)
{
#ifdef RARDLL
  if (Cmd->Callback!=nullptr &&
      Cmd->Callback(UCM_LARGEDICT,Cmd->UserData,(LPARAM)(DictSize/1024),(LPARAM)(MaxDictSize/1024))==1)
    return true; // Continue extracting if unrar.dll callback permits it.
#endif
  return false; // Stop extracting.
}


#ifndef SFX_MODULE
const wchar *uiGetMonthName(uint Month)
{
  return L"";
}
#endif


void uiEolAfterMsg()
{
}
