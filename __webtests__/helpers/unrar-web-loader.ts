/**
 * UnRAR Web 环境模块加载器
 * 为 jsdom 测试环境提供兼容层
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
 * 获取 UnRAR 模块（Web 环境）
 */
export async function getUnrarModule(): Promise<UnrarModule> {
  if (!initPromise) {
    initPromise = (async () => {
      // 在 jsdom 环境中，模拟浏览器加载 unrar.js 的行为
      // 实际上直接使用 require 加载 WASM 模块
      const buildPath = join(__dirname, '../../packages/unrar-wasm/build/unrar.js')
      
      let unrarFactory: any
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        unrarFactory = require(buildPath)
        
        // 将工厂函数挂载到全局 window.Module（模拟浏览器行为）
        if (typeof window !== 'undefined') {
          ;(window as any).Module = unrarFactory
        }
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

