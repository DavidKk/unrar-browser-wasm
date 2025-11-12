import { useState, useEffect } from 'react'
import { getUnrarModule } from '@unrar-browser/core'

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

interface UseUnrarModuleResult {
  module: UnrarModule | null
  loading: boolean
  progress: number
  error: Error | null
}

export function useUnrarModule(): UseUnrarModuleResult {
  const [module, setModule] = useState<UnrarModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
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

        // 从 Vite 环境变量获取 base URL（在 CI 环境中为 '/unrar.js/'）
        const basePath = import.meta.env.BASE_URL || '/'
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
  }, [])

  return { module, loading, progress, error }
}
