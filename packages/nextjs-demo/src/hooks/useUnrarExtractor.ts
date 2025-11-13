import { useCallback, useState } from 'react'

import { UnrarModule } from './useUnrarModule'

export interface ExtractedFile {
  name: string
  size: number | bigint
  isDirectory: boolean
  data: Uint8Array | null
}

interface UseUnrarExtractorResult {
  extractedFiles: ExtractedFile[]
  isExtracting: boolean
  error: Error | null
  extract: (file: File, password?: string) => Promise<void>
  clear: () => void
}

export function useUnrarExtractor(module: UnrarModule | null): UseUnrarExtractorResult {
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const extractRarFile = useCallback(
    async (arrayBuffer: ArrayBuffer, password?: string): Promise<ExtractedFile[]> => {
      if (!module) {
        throw new Error('UnRAR module not loaded')
      }

      // Set password if provided
      if (password) {
        console.log('🔐 Setting password:', '*'.repeat(password.length), `(length: ${password.length})`)
        module.setPassword(password)
        console.log('✅ Password set successfully')
      } else {
        console.log('🔓 No password provided, clearing password')
        module.setPassword('') // Clear password
      }

      const FS = module.FS
      const fileName = '/temp.rar'

      console.log('📝 Writing RAR file to virtual FS:', fileName, 'size:', arrayBuffer.byteLength)
      FS.writeFile(fileName, new Uint8Array(arrayBuffer))

      console.log('🏗️ Creating CommandData and Archive objects')
      const cmdData = new module.CommandData()
      const archive = new module.Archive(cmdData)

      console.log('🔓 Opening archive file:', fileName)
      if (!archive.openFile(fileName)) {
        FS.unlink(fileName)
        throw new Error('Cannot open RAR file')
      }
      console.log('✅ Archive opened successfully')

      console.log('🔍 Validating archive format')
      if (!archive.isArchive(true)) {
        FS.unlink(fileName)
        throw new Error('Not a valid RAR file')
      }
      console.log('✅ Valid RAR archive')

      const files: ExtractedFile[] = []

      while (archive.readHeader() > 0) {
        const headerType = archive.getHeaderType()

        if (headerType === module.HeaderType.HEAD_FILE) {
          const name = archive.getFileName()
          const size = archive.getFileSize()
          const isDirectory = archive.isDirectory()

          console.log(`📄 Found file: ${name} (${isDirectory ? 'directory' : `${size} bytes`})`)

          let data: Uint8Array | null = null

          if (!isDirectory) {
            console.log(`  ⬇️ Reading file data...`)
            const fileData = archive.readFileData()
            const dataSize = fileData.size()
            console.log(`  ✅ Read ${dataSize} bytes`)
            data = new Uint8Array(dataSize)
            for (let i = 0; i < dataSize; i++) {
              data[i] = fileData.get(i)
            }

            // Preview first few bytes
            if (dataSize > 0) {
              const preview = Array.from(data.slice(0, Math.min(10, dataSize)))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join(' ')
              console.log(`  📊 First bytes: ${preview}`)
            }
          }

          files.push({ name, size, isDirectory, data })
        } else if (headerType === module.HeaderType.HEAD_ENDARC) {
          console.log('🏁 End of archive')
          break
        }

        archive.seekToNext()
      }

      FS.unlink(fileName)
      return files
    },
    [module]
  )

  const extract = useCallback(
    async (file: File, password?: string) => {
      if (!module || isExtracting) return

      setIsExtracting(true)
      setExtractedFiles([])
      setError(null)

      try {
        const arrayBuffer = await file.arrayBuffer()
        const files = await extractRarFile(arrayBuffer, password)
        setExtractedFiles(files)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setExtractedFiles([])
      } finally {
        setIsExtracting(false)
      }
    },
    [module, isExtracting, extractRarFile]
  )

  const clear = useCallback(() => {
    setExtractedFiles([])
    setError(null)
  }, [])

  return {
    extractedFiles,
    isExtracting,
    error,
    extract,
    clear,
  }
}
