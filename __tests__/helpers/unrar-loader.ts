/**
 * UnRAR 模块加载器 - 为 Jest 测试提供兼容层
 * 直接使用 require 加载 WASM 模块，避免 ES modules 问题
 */

import { join } from 'path'

export interface UnrarModule {
  Archive: any
  CommandData: any
  setPassword: (password: string) => void
  FS: any
  HeaderType: {
    HEAD_FILE: number
    HEAD_ENDARC: number
  }
  getFileDataPtr: (data: any) => number
  getFileDataSize: (data: any) => number
}

let unrarModule: UnrarModule | null = null
let initPromise: Promise<UnrarModule> | null = null

/**
 * 获取 UnRAR 模块
 */
export async function getUnrarModule(): Promise<UnrarModule> {
  if (!initPromise) {
    initPromise = (async () => {
      // Jest 在 Node.js 环境中，__dirname 已经可用
      // 直接使用 Node.js 的 require 加载编译后的 WASM 模块
      const buildPath = join(__dirname, '../../packages/unrar-wasm/build/unrar.js')
      
      // 使用 require 加载模块
      let unrarFactory: any
      
      try {
        // 在 Jest 环境中，可以直接使用 require
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        unrarFactory = require(buildPath)
      } catch (error) {
        throw new Error(`无法加载 UnRAR 模块: ${buildPath}\n错误: ${error}`)
      }

      // 初始化模块
      const unrar = await unrarFactory()

      unrarModule = {
        Archive: unrar.Archive,
        CommandData: unrar.CommandData,
        setPassword: unrar.setPassword,
        FS: unrar.FS,
        HeaderType: {
          HEAD_FILE: unrar.FILE_HEAD_VALUE,
          HEAD_ENDARC: unrar.ENDARC_HEAD_VALUE,
        },
        getFileDataPtr: unrar.getFileDataPtr,
        getFileDataSize: unrar.getFileDataSize,
      }

      return unrarModule
    })()
  }
  return initPromise
}

