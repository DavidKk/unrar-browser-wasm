// StatusBanner 的状态类型
export type StatusType = 'info' | 'success' | 'error'

// UnrarModule 接口定义
export interface UnrarModule {
  Archive: any
  CommandData: any
  setPassword: (password: string) => void
  FS: any
  HeaderType: {
    HEAD_FILE: number
    HEAD_ENDARC: number
  }
}

// 提取的文件信息
export interface ExtractedFile {
  name: string
  size: number | bigint
  isDirectory: boolean
  data: Uint8Array | null
}
