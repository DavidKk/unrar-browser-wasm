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
const isBrowser = typeof (globalThis as any).window !== 'undefined'

// 获取 base 路径（用于 GitHub Pages 等子路径部署）
function getBasePath(basePath?: string): string {
  // 如果传入了 basePath，直接使用
  if (basePath !== undefined) {
    return basePath.endsWith('/') ? basePath : basePath + '/'
  }
  
  if (!isBrowser) return '/'
  
  // 检查 <base> 标签（构建工具可能会自动添加）
  const baseTag = (globalThis as any).document?.querySelector('base')
  if (baseTag?.href) {
    try {
      const baseUrl = new URL(baseTag.href, (globalThis as any).location?.href)
      const pathname = baseUrl.pathname
      return pathname.endsWith('/') ? pathname : pathname + '/'
    } catch {
      // 如果解析失败，使用默认值
    }
  }
  
  // 默认返回根路径
  return '/'
}

// 动态加载 unrar.js
async function loadUnrarFactory(basePath?: string): Promise<UnrarFactory> {
  if (isBrowser) {
    // 在浏览器中，通过 script 标签加载 UMD 模块
    return new Promise((resolve, reject) => {
      // 检查是否已加载
      const win = globalThis as any
      if (typeof win.window?.Module === 'function') {
        resolve(win.window.Module)
        return
      }

      const resolvedBasePath = getBasePath(basePath)
      const doc = win.document
      if (!doc) {
        reject(new Error('document is not available'))
        return
      }
      const script = doc.createElement('script')
      script.src = resolvedBasePath + 'unrar.js'
      script.onload = () => {
        // UMD 模块会定义一个全局的 Module 函数
        if (typeof win.window?.Module === 'function') {
          resolve(win.window.Module)
        } else {
          reject(new Error('unrar.js loaded but Module is not defined'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load unrar.js'))
      doc.head.appendChild(script)
    })
  } else {
    // Node.js 环境 - 使用 createRequire 来支持 ES modules
    const { createRequire } = await import('module')
    const require = createRequire(import.meta.url)
    
    // 使用相对路径，createRequire 会自动解析相对于当前模块的路径
    // @ts-ignore - 动态 require
    const unrarFactory = require('../build/unrar.js')
    return unrarFactory
  }
}

// 初始化并获取 unrarModule
export async function getUnrarModule(basePath?: string): Promise<UnrarModule> {
  if (!initPromise) {
    initPromise = (async () => {
      const unrarFactory = await loadUnrarFactory(basePath)

      // 配置模块选项
      const moduleOptions: any = {}

      if (isBrowser) {
        // 在浏览器环境中，配置 locateFile 来正确加载 WASM 文件
        const resolvedBasePath = getBasePath(basePath)
        moduleOptions.locateFile = (path: string, prefix: string) => {
          if (path.endsWith('.wasm')) {
            // WASM 文件路径需要包含 base 路径（用于 GitHub Pages 等子路径部署）
            const wasmPath = resolvedBasePath + path
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
