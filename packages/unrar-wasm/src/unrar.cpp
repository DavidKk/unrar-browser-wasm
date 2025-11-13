#include "rar.hpp"
#include <emscripten/bind.h>
#include <vector>
#include <iostream>

using namespace emscripten;

// 用于设置密码的全局变量（移除 static 以便其他编译单元访问）
char globalPassword[256] = {0};

void setPassword(const std::string& password) {
    strncpy(globalPassword, password.c_str(), sizeof(globalPassword) - 1);
    globalPassword[sizeof(globalPassword) - 1] = '\0';
}

// 前向声明
class Archive;
std::vector<uint8_t> readSubData(Archive& arc);

// FileHeader 辅助函数
std::string getFileName(FileHeader& header) {
    std::wstring wname(header.FileName);
    std::string result;
    for (wchar_t wc : wname) {
        if (wc == 0) break;
        if (wc < 128) {  // ASCII characters
            result += (char)wc;
        } else {
            // For non-ASCII, use UTF-8 encoding (simple approach for now)
            result += '?';
        }
    }
    return result;
}

// Archive 包装类，提供更友好的 API
class ArchiveWrapper {
private:
    Archive* arc;
    CommandData* cmd;
    bool opened;

public:
    ArchiveWrapper(CommandData* cmdData) : cmd(cmdData), opened(false) {
        arc = new Archive(cmdData);
    }
    
    ~ArchiveWrapper() {
        if (arc) {
            arc->Close();
            delete arc;
        }
    }
    
    bool openFile(const std::string& fileName) {
        // 打开文件前，将全局密码设置到 CommandData 中
        if (globalPassword[0] != '\0') {
            std::wstring wpassword;
            for (int i = 0; globalPassword[i] != '\0'; i++) {
                wpassword += (wchar_t)globalPassword[i];
            }
            cmd->Password.Set(wpassword.c_str());
            std::cout << "密码已设置到 CommandData" << std::endl;
        }
        
        std::wstring wfileName(fileName.begin(), fileName.end());
        opened = arc->Open(wfileName.c_str(), 0);
        return opened;
    }
    
    bool isArchive(bool enableBroken) {
        return arc->IsArchive(enableBroken);
    }
    
    int readHeader() {
        return arc->ReadHeader();
    }
    
    int getHeaderType() {
        return arc->GetHeaderType();
    }
    
    void seekToNext() {
        arc->SeekToNext();
    }
    
    std::string getFileName() {
        return ::getFileName(arc->FileHead);
    }
    
    int64_t getFileSize() {
        return arc->FileHead.UnpSize;
    }
    
    int64_t getFilePackSize() {
        return arc->FileHead.PackSize;
    }
    
    bool isDirectory() {
        return arc->FileHead.Dir;
    }
    
    std::vector<uint8_t> readFileData() {
        return readSubData(*arc);
    }
};

// 用于读取文件内容的辅助函数
std::vector<uint8_t> readSubData(Archive& arc) {
    std::vector<uint8_t> data;
    
    int64_t dataSize = arc.FileHead.UnpSize;
    if (dataSize <= 0 || dataSize > 1024 * 1024 * 100) {  // 限制最大 100MB
        return data;
    }
    
    data.resize(dataSize);
    
    std::cout << "方法值: 0x" << std::hex << arc.FileHead.Method << std::dec << std::endl;
    std::cout << "文件是否加密: " << (arc.FileHead.Encrypted ? "是" : "否") << std::endl;
    std::cout << "加密方法: " << arc.FileHead.CryptMethod << std::endl;
    std::cout << "是否有盐值: " << (arc.FileHead.SaltSet ? "是" : "否") << std::endl;
    
    // 简单实现：尝试读取原始数据
    // 对于存储模式（未压缩），直接读取
    // 注意：Method 0 表示存储（无压缩）
    if (arc.FileHead.Method == 0) {  // Storing (no compression)
        std::cout << "使用存储模式（无压缩）直接读取" << std::endl;
        // 跳转到文件数据开始位置
        arc.Seek(arc.NextBlockPos - arc.FileHead.PackSize, SEEK_SET);
        int bytesRead = arc.Read(data.data(), dataSize);
        std::cout << "读取了 " << bytesRead << " 字节，期望 " << dataSize << " 字节" << std::endl;
        if (bytesRead != dataSize) {
            std::cout << "警告：读取字节数不匹配！" << std::endl;
            data.clear();
        }
    } else {
        std::cout << "使用解压模式" << std::endl;
        // 对于压缩文件，使用 Unpack
        ComprDataIO dataIO;
        
        // 设置文件
        dataIO.SetFiles(&arc, nullptr);
        dataIO.SetUnpackToMemory(data.data(), dataSize);
        dataIO.SetPackedSizeToRead(arc.FileHead.PackSize);
        
        // 设置加密 (如果文件是加密的)
        if (arc.FileHead.Encrypted) {
            std::cout << "文件已加密，设置解密参数" << std::endl;
            CommandData* cmd = arc.GetCommandData();
            if (cmd != nullptr) {
                SecPassword FilePassword = cmd->Password;
                byte PswCheck[SIZE_PSWCHECK];
                bool EncSet = dataIO.SetEncryption(
                    false,  // Decrypt mode
                    arc.FileHead.CryptMethod,
                    &FilePassword,
                    arc.FileHead.SaltSet ? arc.FileHead.Salt : nullptr,
                    arc.FileHead.InitV,
                    arc.FileHead.Lg2Count,
                    arc.FileHead.HashKey,
                    PswCheck
                );
                std::cout << "SetEncryption 返回: " << EncSet << std::endl;
            } else {
                std::cout << "警告：无法获取 CommandData！" << std::endl;
            }
        }
        
        // 创建并初始化 Unpack 对象
        Unpack unpack(&dataIO);
        unpack.Init(arc.FileHead.WinSize, false);
        unpack.SetDestSize(dataSize);
        
        // 执行解压
        try {
            unpack.DoUnpack(arc.FileHead.UnpVer, false);
        } catch (...) {
            data.clear();
        }
    }
    
    return data;
}

// 用于获取数据指针的辅助函数
uintptr_t getFileDataPtr(const std::vector<uint8_t>& data) {
    return reinterpret_cast<uintptr_t>(data.data());
}

// 用于获取数据大小的辅助函数
size_t getFileDataSize(const std::vector<uint8_t>& data) {
    return data.size();
}

// Emscripten 绑定
EMSCRIPTEN_BINDINGS(unrar) {
    // 注册 std::vector<uint8_t>
    register_vector<uint8_t>("VectorUint8");

    // 绑定辅助函数
    function("setPassword", &setPassword);
    function("getFileDataPtr", &getFileDataPtr);
    function("getFileDataSize", &getFileDataSize);

    // 绑定 ArchiveWrapper 为 Archive
    class_<ArchiveWrapper>("Archive")
        .constructor<CommandData*>()
        .function("openFile", &ArchiveWrapper::openFile)
        .function("isArchive", &ArchiveWrapper::isArchive)
        .function("readHeader", &ArchiveWrapper::readHeader)
        .function("getHeaderType", &ArchiveWrapper::getHeaderType)
        .function("seekToNext", &ArchiveWrapper::seekToNext)
        .function("getFileName", &ArchiveWrapper::getFileName)
        .function("getFileSize", &ArchiveWrapper::getFileSize)
        .function("getFilePackSize", &ArchiveWrapper::getFilePackSize)
        .function("isDirectory", &ArchiveWrapper::isDirectory)
        .function("readFileData", &ArchiveWrapper::readFileData);

    // 绑定 CommandData 类
    class_<CommandData>("CommandData")
        .constructor<>();

    // HeaderType 常量 - 将通过 JavaScript 包装器访问
    // 直接导出常量值
    constant("FILE_HEAD_VALUE", (int)HEAD_FILE);
    constant("ENDARC_HEAD_VALUE", (int)HEAD_ENDARC);
}
