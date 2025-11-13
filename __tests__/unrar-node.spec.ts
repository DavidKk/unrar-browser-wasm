import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

import { getUnrarModule } from './helpers/unrar-loader'

describe('UnRAR Node.js 环境测试', () => {
  let unrar: any
  const testRarFile = join(__dirname, '../packages/node-demo/noencryption.rar')

  beforeAll(async () => {
    // 设置超时时间，因为加载 WASM 模块可能需要一些时间
    jest.setTimeout(30000)

    // 初始化 unrar 模块
    // eslint-disable-next-line no-console
    console.log('正在加载 UnRAR 模块...')
    unrar = await getUnrarModule()
    // eslint-disable-next-line no-console
    console.log('UnRAR 模块加载成功')
  }, 30000)

  test('应该成功加载 UnRAR 模块', () => {
    expect(unrar).toBeDefined()
    expect(unrar.Archive).toBeDefined()
    expect(unrar.CommandData).toBeDefined()
    expect(unrar.FS).toBeDefined()
    expect(unrar.HeaderType).toBeDefined()
    expect(typeof unrar.setPassword).toBe('function')
  })

  test('UnRAR 模块应该包含正确的 HeaderType', () => {
    expect(unrar.HeaderType.HEAD_FILE).toBeDefined()
    expect(unrar.HeaderType.HEAD_ENDARC).toBeDefined()
    expect(typeof unrar.HeaderType.HEAD_FILE).toBe('number')
    expect(typeof unrar.HeaderType.HEAD_ENDARC).toBe('number')
  })

  test('测试 RAR 文件应该存在', () => {
    expect(existsSync(testRarFile)).toBe(true)
  })

  test('应该能够打开并验证 RAR 文件', () => {
    // 读取 RAR 文件
    const rarBuffer = readFileSync(testRarFile)
    const rarData = new Uint8Array(rarBuffer)

    expect(rarData.length).toBeGreaterThan(0)

    // 写入虚拟文件系统
    const FS = unrar.FS
    const virtualPath = '/test-open.rar'
    FS.writeFile(virtualPath, rarData)

    // 打开归档
    const cmdData = new unrar.CommandData()
    const archive = new unrar.Archive(cmdData)

    const openResult = archive.openFile(virtualPath)
    expect(openResult).toBe(true)

    // 验证是否为有效的 RAR 归档
    const isValidArchive = archive.isArchive(true)
    expect(isValidArchive).toBe(true)

    // 清理
    FS.unlink(virtualPath)
  })

  test('应该能够读取 RAR 文件头信息', () => {
    // 读取 RAR 文件
    const rarBuffer = readFileSync(testRarFile)
    const rarData = new Uint8Array(rarBuffer)

    // 写入虚拟文件系统
    const FS = unrar.FS
    const virtualPath = '/test-header.rar'
    FS.writeFile(virtualPath, rarData)

    // 打开归档
    const cmdData = new unrar.CommandData()
    const archive = new unrar.Archive(cmdData)

    archive.openFile(virtualPath)
    archive.isArchive(true)

    // 读取第一个文件头
    const headerResult = archive.readHeader()
    expect(headerResult).toBeGreaterThan(0)

    // 获取头类型
    const headerType = archive.getHeaderType()
    expect(headerType).toBe(unrar.HeaderType.HEAD_FILE)

    // 清理
    FS.unlink(virtualPath)
  })

  test('应该能够提取 RAR 文件中的文件列表', () => {
    // 读取 RAR 文件
    const rarBuffer = readFileSync(testRarFile)
    const rarData = new Uint8Array(rarBuffer)

    // 写入虚拟文件系统
    const FS = unrar.FS
    const virtualPath = '/test-list.rar'
    FS.writeFile(virtualPath, rarData)

    // 打开归档
    const cmdData = new unrar.CommandData()
    const archive = new unrar.Archive(cmdData)

    archive.openFile(virtualPath)
    archive.isArchive(true)

    const files: Array<{ name: string; size: number | bigint; isDirectory: boolean }> = []

    // 遍历所有文件
    while (archive.readHeader() > 0) {
      const headerType = archive.getHeaderType()

      if (headerType === unrar.HeaderType.HEAD_FILE) {
        const name = archive.getFileName()
        const size = archive.getFileSize()
        const isDirectory = archive.isDirectory()

        files.push({ name, size, isDirectory })

        // eslint-disable-next-line no-console
        console.log(`  ${isDirectory ? '📁' : '📄'} ${name} ${!isDirectory ? `(${size} bytes)` : ''}`)
      } else if (headerType === unrar.HeaderType.HEAD_ENDARC) {
        break
      }

      archive.seekToNext()
    }

    // 验证至少有一个文件
    expect(files.length).toBeGreaterThan(0)

    // 验证文件结构
    files.forEach((file) => {
      expect(file.name).toBeDefined()
      expect(typeof file.name).toBe('string')
      expect(file.name.length).toBeGreaterThan(0)
      expect(typeof file.isDirectory).toBe('boolean')

      if (!file.isDirectory) {
        expect(file.size).toBeGreaterThanOrEqual(0)
      }
    })

    // eslint-disable-next-line no-console
    console.log(`\n  总计: ${files.length} 个文件/目录`)

    // 清理
    FS.unlink(virtualPath)
  })

  test('应该能够提取并读取 RAR 文件中的文件内容', () => {
    // 读取 RAR 文件
    const rarBuffer = readFileSync(testRarFile)
    const rarData = new Uint8Array(rarBuffer)

    // 写入虚拟文件系统
    const FS = unrar.FS
    const virtualPath = '/test-extract.rar'
    FS.writeFile(virtualPath, rarData)

    // 打开归档
    const cmdData = new unrar.CommandData()
    const archive = new unrar.Archive(cmdData)

    archive.openFile(virtualPath)
    archive.isArchive(true)

    let extractedFileCount = 0

    // 遍历并提取所有文件
    while (archive.readHeader() > 0) {
      const headerType = archive.getHeaderType()

      if (headerType === unrar.HeaderType.HEAD_FILE) {
        const name = archive.getFileName()
        const size = archive.getFileSize()
        const isDirectory = archive.isDirectory()

        if (!isDirectory) {
          // 读取文件数据
          const fileData = archive.readFileData()
          const dataSize = fileData.size()

          expect(dataSize).toBeGreaterThanOrEqual(0)

          // 提取数据到 Uint8Array
          const data = new Uint8Array(dataSize)
          for (let i = 0; i < dataSize; i++) {
            data[i] = fileData.get(i)
          }

          // 验证提取的数据
          expect(data).toBeDefined()
          expect(data.length).toBe(dataSize)

          // eslint-disable-next-line no-console
          console.log(`  ✓ 提取文件: ${name} (${dataSize} bytes)`)
          extractedFileCount++
        }
      } else if (headerType === unrar.HeaderType.HEAD_ENDARC) {
        break
      }

      archive.seekToNext()
    }

    // 验证至少提取了一个文件
    expect(extractedFileCount).toBeGreaterThan(0)
    // eslint-disable-next-line no-console
    console.log(`\n  成功提取: ${extractedFileCount} 个文件`)

    // 清理
    FS.unlink(virtualPath)
  })

  test('应该能够正确处理不存在的 RAR 文件', () => {
    const FS = unrar.FS
    const virtualPath = '/non-existent.rar'

    // 尝试打开不存在的文件
    const cmdData = new unrar.CommandData()
    const archive = new unrar.Archive(cmdData)

    const openResult = archive.openFile(virtualPath)
    expect(openResult).toBe(false)
  })

  test('应该能够正确处理无效的 RAR 文件', () => {
    const FS = unrar.FS
    const virtualPath = '/invalid.rar'

    // 创建一个无效的 RAR 文件（随机数据）
    const invalidData = new Uint8Array(100)
    for (let i = 0; i < 100; i++) {
      invalidData[i] = Math.floor(Math.random() * 256)
    }

    FS.writeFile(virtualPath, invalidData)

    // 尝试打开无效文件
    const cmdData = new unrar.CommandData()
    const archive = new unrar.Archive(cmdData)

    const openResult = archive.openFile(virtualPath)

    // 可能打开成功，但验证应该失败
    if (openResult) {
      const isValidArchive = archive.isArchive(true)
      expect(isValidArchive).toBe(false)
    }

    // 清理
    FS.unlink(virtualPath)
  })

  test('应该能够多次初始化（测试单例模式）', async () => {
    const { getUnrarModule: testGetUnrarModule } = await import('./helpers/unrar-loader')
    const unrar1 = await testGetUnrarModule()
    const unrar2 = await testGetUnrarModule()

    // 验证返回的是同一个实例
    expect(unrar1).toBe(unrar2)
    expect(unrar1).toBe(unrar)
  })
})
