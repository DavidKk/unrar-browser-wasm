// 类型定义
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

type UnrarFactory = (options?: any) => Promise<any>

let unrarModule: UnrarModule | null = null
let initPromise: Promise<UnrarModule> | null = null

// 检测运行环境
const isBrowser = typeof window !== 'undefined'

// 动态加载 unrar.js
async function loadUnrarFactory(): Promise<UnrarFactory> {
  if (isBrowser) {
    // 在浏览器中，通过 script 标签加载 UMD 模块
    return new Promise((resolve, reject) => {
      // 检查是否已加载
      if (typeof (window as any).Module === 'function') {
        resolve((window as any).Module)
        return
      }

      const script = document.createElement('script')
      script.src = '/unrar.js'
      script.onload = () => {
        // UMD 模块会定义一个全局的 Module 函数
        if (typeof (window as any).Module === 'function') {
          resolve((window as any).Module)
        } else {
          reject(new Error('unrar.js loaded but Module is not defined'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load unrar.js'))
      document.head.appendChild(script)
    })
  } else {
    // Node.js 环境 - 使用 require
    // @ts-ignore - 动态 require
    const unrarFactory = require('../build/unrar.js')
    return unrarFactory
  }
}

// 初始化并获取 unrarModule
export async function getUnrarModule(): Promise<UnrarModule> {
  if (!initPromise) {
    initPromise = (async () => {
      const unrarFactory = await loadUnrarFactory()

      // 配置模块选项
      const moduleOptions: any = {}

      if (isBrowser) {
        // 在浏览器环境中，配置 locateFile 来正确加载 WASM 文件
        moduleOptions.locateFile = (path: string, prefix: string) => {
          if (path.endsWith('.wasm')) {
            // WASM 文件在根路径可访问（通过 publicDir 配置）
            const wasmPath = '/' + path
            console.log('[locateFile] WASM 文件路径:', wasmPath)
            return wasmPath
          }
          return prefix + path
        }
      }

      const unrar = await unrarFactory(moduleOptions)

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

// 默认导出也是 getUnrarModule 函数
export default getUnrarModule
