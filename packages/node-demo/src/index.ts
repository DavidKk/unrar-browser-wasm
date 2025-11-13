import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname, basename, resolve, isAbsolute } from 'path'
import { getUnrarModule } from '@unrar-browser/core'

interface ExtractedFile {
  name: string
  size: number | bigint
  isDirectory: boolean
  data: Uint8Array | null
}

/**
 * 从 RAR 文件中提取所有文件
 */
async function extractRarFile(rarFilePath: string, outputDir?: string): Promise<ExtractedFile[]> {
  console.log(`📦 正在加载 UnRAR 模块...`)
  const unrar = await getUnrarModule()

  console.log(`📂 正在读取 RAR 文件: ${rarFilePath}`)
  const rarBuffer = readFileSync(rarFilePath)
  const rarData = new Uint8Array(rarBuffer)

  // 写入虚拟文件系统
  const FS = unrar.FS
  const virtualPath = '/temp.rar'
  FS.writeFile(virtualPath, rarData)

  console.log(`🔍 正在打开归档...`)
  const cmdData = new unrar.CommandData()
  const archive = new unrar.Archive(cmdData)

  if (!archive.openFile(virtualPath)) {
    FS.unlink(virtualPath)
    throw new Error('无法打开 RAR 文件')
  }

  if (!archive.isArchive(true)) {
    FS.unlink(virtualPath)
    throw new Error('不是有效的 RAR 文件')
  }

  console.log(`✅ 归档验证成功，开始提取文件...\n`)
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
        console.log(`📁 ${name} (目录)`)
      } else {
        console.log(`📄 ${name} (${formatSize(size)})`)
      }
    } else if (headerType === unrar.HeaderType.HEAD_ENDARC) {
      break
    }

    archive.seekToNext()
  }

  // 清理虚拟文件
  FS.unlink(virtualPath)

  // 如果指定了输出目录，保存文件
  if (outputDir && files.length > 0) {
    console.log(`\n💾 正在保存文件到: ${outputDir}`)
    saveFiles(files, outputDir)
  }

  return files
}

/**
 * 保存提取的文件到磁盘
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
      console.log(`  ✓ 创建目录: ${file.name}`)
    } else if (file.data) {
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true })
      }
      writeFileSync(filePath, file.data)
      console.log(`  ✓ 保存文件: ${file.name}`)
    }
  }
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number | bigint): string {
  const size = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('用法: npm start <rar文件路径> [输出目录]')
    console.log('示例: npm start q.rar ./output')
    process.exit(1)
  }

  const rarFilePathArg = args[0]
  const outputDirArg = args[1] || './output'

  // 解析 RAR 文件路径
  // 如果是绝对路径，直接使用；否则尝试多个可能的路径
  let rarFilePath: string
  if (isAbsolute(rarFilePathArg)) {
    rarFilePath = rarFilePathArg
  } else {
    const cwd = process.cwd()
    // 先尝试相对于当前工作目录
    rarFilePath = resolve(cwd, rarFilePathArg)
    
    if (!existsSync(rarFilePath)) {
      // 如果路径包含 packages/，可能是从根目录传入的路径
      // 尝试从项目根目录解析
      if (rarFilePathArg.includes('packages/') || rarFilePathArg.startsWith('../')) {
        // 如果当前在 node-demo 目录，向上两级到根目录
        if (cwd.endsWith('node-demo')) {
          const projectRoot = resolve(cwd, '../..')
          rarFilePath = resolve(projectRoot, rarFilePathArg)
        } else if (cwd.endsWith('packages')) {
          // 如果在 packages 目录，向上一级到根目录
          const projectRoot = resolve(cwd, '..')
          rarFilePath = resolve(projectRoot, rarFilePathArg)
        } else {
          // 其他情况，尝试从当前目录向上查找包含 packages 的目录
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

  // 解析输出目录
  const outputDir = isAbsolute(outputDirArg) 
    ? outputDirArg 
    : resolve(process.cwd(), outputDirArg)

  if (!existsSync(rarFilePath)) {
    console.error(`❌ 错误: 文件不存在: ${rarFilePath}`)
    console.error(`   尝试的路径: ${rarFilePathArg}`)
    console.error(`   当前工作目录: ${process.cwd()}`)
    process.exit(1)
  }

  try {
    console.log('🚀 UnRAR Node.js Demo\n')
    console.log('='.repeat(50))

    const files = await extractRarFile(rarFilePath, outputDir)

    console.log('='.repeat(50))
    console.log(`\n✨ 提取完成!`)
    console.log(`📊 总计: ${files.length} 个文件/目录`)
    console.log(`📁 输出目录: ${outputDir}`)
  } catch (error) {
    console.error('\n❌ 错误:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// 运行主函数
main().catch((error) => {
  console.error('未捕获的错误:', error)
  process.exit(1)
})

