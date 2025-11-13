import { getUnrarModule } from '@unrar-browser/core'
import { useEffect, useState } from 'react'

import { UnrarModule } from '../types'

interface UseUnrarModuleResult {
  module: UnrarModule | null
  loading: boolean
  progress: number
  error: Error | null
}

interface UseUnrarModuleOptions {
  // 用于 Vite：从 import.meta.env.BASE_URL 获取
  basePath?: string
  // 用于 Next.js：自动检测路径中的子目录（例如 /nextjs-demo）
  autoDetectSubPath?: string
}

export function useUnrarModule(options: UseUnrarModuleOptions = {}): UseUnrarModuleResult {
  const [module, setModule] = useState<UnrarModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // 确保只在浏览器环境中运行（Next.js SSR 支持）
    if (typeof window === 'undefined') {
      return
    }

    let mounted = true
    let progressInterval: NodeJS.Timeout | null = null

    const loadModule = async () => {
      try {
        setLoading(true)
        setProgress(0)

        // 模拟进度增长到 90%
        let currentProgress = 0
        progressInterval = setInterval(() => {
          if (currentProgress < 90) {
            currentProgress += Math.random() * 15
            if (currentProgress > 90) currentProgress = 90
            if (mounted) {
              setProgress(currentProgress)
            }
          }
        }, 200)

        // 确定 basePath
        let basePath = options.basePath || '/'

        // 如果指定了 autoDetectSubPath，则自动检测子路径
        if (options.autoDetectSubPath && typeof window !== 'undefined') {
          const pathname = window.location.pathname
          if (pathname.includes(options.autoDetectSubPath)) {
            const match = pathname.match(new RegExp(`^(.*?${options.autoDetectSubPath})`))
            if (match) {
              basePath = match[1] + '/'
            }
          }
        }

        const loadedModule = await getUnrarModule(basePath)

        if (progressInterval) {
          clearInterval(progressInterval)
        }

        if (mounted) {
          setProgress(100)
          setModule(loadedModule)
          setError(null)
        }
      } catch (err) {
        if (progressInterval) {
          clearInterval(progressInterval)
        }
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setProgress(0)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadModule()

    return () => {
      mounted = false
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [options.basePath, options.autoDetectSubPath])

  return { module, loading, progress, error }
}
