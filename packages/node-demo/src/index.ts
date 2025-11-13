import { getUnrarModule } from '@unrar-browser/core'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, dirname, isAbsolute, join, resolve } from 'path'

interface ExtractedFile {
  name: string
  size: number | bigint
  isDirectory: boolean
  data: Uint8Array | null
}

/**
 * Extract all files from RAR archive
 */
async function extractRarFile(rarFilePath: string, outputDir?: string, password?: string): Promise<ExtractedFile[]> {
  console.log(`📦 Loading UnRAR module...`)
  const unrar = await getUnrarModule()

  console.log(`📂 Reading RAR file: ${rarFilePath}`)

  // Set password if provided
  if (password) {
    console.log(`🔐 Password: ${'*'.repeat(password.length)}`)
    unrar.setPassword(password)
  }

  const rarBuffer = readFileSync(rarFilePath)
  const rarData = new Uint8Array(rarBuffer)

  // Write to virtual file system
  const FS = unrar.FS
  const virtualPath = '/temp.rar'
  FS.writeFile(virtualPath, rarData)

  console.log(`🔍 Opening archive...`)
  const cmdData = new unrar.CommandData()
  const archive = new unrar.Archive(cmdData)

  if (!archive.openFile(virtualPath)) {
    FS.unlink(virtualPath)
    throw new Error('Cannot open RAR file')
  }

  if (!archive.isArchive(true)) {
    FS.unlink(virtualPath)
    throw new Error('Not a valid RAR file')
  }

  console.log(`✅ Archive validated successfully, extracting files...\n`)
  const files: ExtractedFile[] = []

  while (archive.readHeader() > 0) {
    const headerType = archive.getHeaderType()

    if (headerType === unrar.HeaderType.HEAD_FILE) {
      const name = archive.getFileName()
      const size = archive.getFileSize()
      const isDirectory = archive.isDirectory()

      let data: Uint8Array | null = null

      if (!isDirectory) {
        const fileData = archive.readFileData()
        const dataSize = fileData.size()
        data = new Uint8Array(dataSize)
        for (let i = 0; i < dataSize; i++) {
          data[i] = fileData.get(i)
        }
      }

      files.push({ name, size, isDirectory, data })

      if (isDirectory) {
        console.log(`📁 ${name} (Directory)`)
      } else {
        console.log(`📄 ${name} (${formatSize(size)})`)
      }
    } else if (headerType === unrar.HeaderType.HEAD_ENDARC) {
      break
    }

    archive.seekToNext()
  }

  // Clean up virtual file
  FS.unlink(virtualPath)

  // Save files if output directory is specified
  if (outputDir && files.length > 0) {
    console.log(`\n💾 Saving files to: ${outputDir}`)
    saveFiles(files, outputDir)
  }

  return files
}

/**
 * Save extracted files to disk
 */
function saveFiles(files: ExtractedFile[], outputDir: string): void {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  for (const file of files) {
    const filePath = join(outputDir, file.name)
    const fileDir = dirname(filePath)

    if (file.isDirectory) {
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true })
      }
      console.log(`  ✓ Created directory: ${file.name}`)
    } else if (file.data) {
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true })
      }
      writeFileSync(filePath, file.data)
      console.log(`  ✓ Saved file: ${file.name}`)
    }
  }
}

/**
 * Format file size
 */
function formatSize(bytes: number | bigint): string {
  const size = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: npm start <rar-file-path> [output-directory] [password]')
    console.log('Example: npm start encryption.rar ./output 123')
    process.exit(1)
  }

  const rarFilePathArg = args[0]
  const outputDirArg = args[1] || './output'
  const password = args[2] // Optional password parameter

  // Parse RAR file path
  // If absolute path, use it directly; otherwise try multiple possible paths
  let rarFilePath: string
  if (isAbsolute(rarFilePathArg)) {
    rarFilePath = rarFilePathArg
  } else {
    const cwd = process.cwd()
    // First try relative to current working directory
    rarFilePath = resolve(cwd, rarFilePathArg)

    if (!existsSync(rarFilePath)) {
      // If path contains packages/, it might be passed from root directory
      // Try to resolve from project root directory
      if (rarFilePathArg.includes('packages/') || rarFilePathArg.startsWith('../')) {
        // If currently in node-demo directory, go up two levels to root
        if (cwd.endsWith('node-demo')) {
          const projectRoot = resolve(cwd, '../..')
          rarFilePath = resolve(projectRoot, rarFilePathArg)
        } else if (cwd.endsWith('packages')) {
          // If in packages directory, go up one level to root
          const projectRoot = resolve(cwd, '..')
          rarFilePath = resolve(projectRoot, rarFilePathArg)
        } else {
          // In other cases, try to find directory containing packages upwards from current directory
          let currentDir = cwd
          while (currentDir !== dirname(currentDir)) {
            if (existsSync(resolve(currentDir, rarFilePathArg))) {
              rarFilePath = resolve(currentDir, rarFilePathArg)
              break
            }
            currentDir = dirname(currentDir)
          }
        }
      }
    }
  }

  // Parse output directory
  const outputDir = isAbsolute(outputDirArg) ? outputDirArg : resolve(process.cwd(), outputDirArg)

  if (!existsSync(rarFilePath)) {
    console.error(`❌ Error: File does not exist: ${rarFilePath}`)
    console.error(`   Attempted path: ${rarFilePathArg}`)
    console.error(`   Current working directory: ${process.cwd()}`)
    process.exit(1)
  }

  try {
    console.log('🚀 UnRAR Node.js Demo\n')
    console.log('='.repeat(50))

    const files = await extractRarFile(rarFilePath, outputDir, password)

    console.log('='.repeat(50))
    console.log(`\n✨ Extraction complete!`)
    console.log(`📊 Total: ${files.length} file(s)/directory(ies)`)
    console.log(`📁 Output directory: ${outputDir}`)
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run main function
main().catch((error) => {
  console.error('Uncaught error:', error)
  process.exit(1)
})
