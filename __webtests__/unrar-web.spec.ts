/**
 * UnRAR Web 环境测试（jsdom）
 * 测试在浏览器环境下的功能
 */

import { readFileSync } from 'fs'
import { join } from 'path'

import type { UnrarModule } from './helpers/unrar-web-loader'
import { getUnrarModule } from './helpers/unrar-web-loader'

describe('UnRAR Web 环境测试', () => {
  let unrar: UnrarModule

  beforeAll(async () => {
    // 设置超时时间
    jest.setTimeout(30000)

    // 模拟浏览器环境
    // 在 jsdom 环境中，需要确保 window 和 document 存在
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      console.log('✓ jsdom 环境已就绪')
      console.log('  - window:', typeof window)
      console.log('  - document:', typeof document)
      console.log('  - navigator:', typeof navigator)
    }

    // 初始化 unrar 模块
    console.log('正在初始化 UnRAR 模块（浏览器环境）...')
    unrar = await getUnrarModule()
    console.log('✓ UnRAR 模块初始化成功')
  }, 30000)

  describe('浏览器环境检查', () => {
    test('应该在 jsdom 环境中运行', () => {
      expect(typeof window).toBe('object')
      expect(typeof document).toBe('object')
      expect(typeof navigator).toBe('object')
    })

    test('应该有 DOM API', () => {
      expect(typeof document.createElement).toBe('function')
      expect(typeof document.querySelector).toBe('function')
    })

    test('window.Module 应该已定义', () => {
      expect(typeof (window as any).Module).toBe('function')
    })
  })

  describe('模块加载测试', () => {
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
  })

  describe('RAR 文件操作测试', () => {
    const testRarFile = join(__dirname, '../packages/node-demo/noencryption.rar')

    test('应该能够打开并验证 RAR 文件', () => {
      // 读取 RAR 文件
      const rarBuffer = readFileSync(testRarFile)
      const rarData = new Uint8Array(rarBuffer)

      expect(rarData.length).toBeGreaterThan(0)

      // 写入虚拟文件系统
      const FS = unrar.FS
      const virtualPath = '/test-web-open.rar'
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
      const rarBuffer = readFileSync(testRarFile)
      const rarData = new Uint8Array(rarBuffer)

      const FS = unrar.FS
      const virtualPath = '/test-web-header.rar'
      FS.writeFile(virtualPath, rarData)

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
      const rarBuffer = readFileSync(testRarFile)
      const rarData = new Uint8Array(rarBuffer)

      const FS = unrar.FS
      const virtualPath = '/test-web-list.rar'
      FS.writeFile(virtualPath, rarData)

      const cmdData = new unrar.CommandData()
      const archive = new unrar.Archive(cmdData)

      archive.openFile(virtualPath)
      archive.isArchive(true)

      const files: Array<{ name: string; size: number | bigint; isDirectory: boolean }> = []

      while (archive.readHeader() > 0) {
        const headerType = archive.getHeaderType()

        if (headerType === unrar.HeaderType.HEAD_FILE) {
          const name = archive.getFileName()
          const size = archive.getFileSize()
          const isDirectory = archive.isDirectory()

          files.push({ name, size, isDirectory })
          console.log(`  ${isDirectory ? '📁' : '📄'} ${name} ${!isDirectory ? `(${size} bytes)` : ''}`)
        } else if (headerType === unrar.HeaderType.HEAD_ENDARC) {
          break
        }

        archive.seekToNext()
      }

      expect(files.length).toBeGreaterThan(0)

      files.forEach((file) => {
        expect(file.name).toBeDefined()
        expect(typeof file.name).toBe('string')
        expect(file.name.length).toBeGreaterThan(0)
        expect(typeof file.isDirectory).toBe('boolean')

        if (!file.isDirectory) {
          expect(file.size).toBeGreaterThanOrEqual(0)
        }
      })

      console.log(`  总计: ${files.length} 个文件/目录`)

      // 清理
      FS.unlink(virtualPath)
    })

    test('应该能够提取并读取 RAR 文件中的文件内容', () => {
      const rarBuffer = readFileSync(testRarFile)
      const rarData = new Uint8Array(rarBuffer)

      const FS = unrar.FS
      const virtualPath = '/test-web-extract.rar'
      FS.writeFile(virtualPath, rarData)

      const cmdData = new unrar.CommandData()
      const archive = new unrar.Archive(cmdData)

      archive.openFile(virtualPath)
      archive.isArchive(true)

      let extractedFileCount = 0

      while (archive.readHeader() > 0) {
        const headerType = archive.getHeaderType()

        if (headerType === unrar.HeaderType.HEAD_FILE) {
          const name = archive.getFileName()
          const isDirectory = archive.isDirectory()

          if (!isDirectory) {
            const fileData = archive.readFileData()
            const dataSize = fileData.size()

            expect(dataSize).toBeGreaterThanOrEqual(0)

            const data = new Uint8Array(dataSize)
            for (let i = 0; i < dataSize; i++) {
              data[i] = fileData.get(i)
            }

            expect(data).toBeDefined()
            expect(data.length).toBe(dataSize)

            console.log(`  ✓ 提取文件: ${name} (${dataSize} bytes)`)
            extractedFileCount++
          }
        } else if (headerType === unrar.HeaderType.HEAD_ENDARC) {
          break
        }

        archive.seekToNext()
      }

      expect(extractedFileCount).toBeGreaterThan(0)
      console.log(`  成功提取: ${extractedFileCount} 个文件`)

      // 清理
      FS.unlink(virtualPath)
    })
  })

  describe('错误处理测试', () => {
    test('应该能够正确处理不存在的 RAR 文件', () => {
      const FS = unrar.FS
      const virtualPath = '/non-existent.rar'

      const cmdData = new unrar.CommandData()
      const archive = new unrar.Archive(cmdData)

      const openResult = archive.openFile(virtualPath)
      expect(openResult).toBe(false)
    })

    test('应该能够正确处理无效的 RAR 文件', () => {
      const FS = unrar.FS
      const virtualPath = '/invalid-web.rar'

      const invalidData = new Uint8Array(100)
      for (let i = 0; i < 100; i++) {
        invalidData[i] = Math.floor(Math.random() * 256)
      }

      FS.writeFile(virtualPath, invalidData)

      const cmdData = new unrar.CommandData()
      const archive = new unrar.Archive(cmdData)

      const openResult = archive.openFile(virtualPath)

      if (openResult) {
        const isValidArchive = archive.isArchive(true)
        expect(isValidArchive).toBe(false)
      }

      // 清理
      FS.unlink(virtualPath)
    })
  })

  describe('虚拟文件系统测试', () => {
    test('应该能够在虚拟文件系统中创建和删除文件', () => {
      const FS = unrar.FS
      const testPath = '/test-vfs.txt'
      const testData = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"

      // 写入文件
      FS.writeFile(testPath, testData)

      // 读取文件
      const readData = FS.readFile(testPath)
      expect(readData).toBeDefined()
      expect(readData.length).toBe(testData.length)

      // 删除文件
      FS.unlink(testPath)
    })

    test('虚拟文件系统应该支持 Uint8Array', () => {
      const FS = unrar.FS
      const testPath = '/test-uint8array.bin'
      const testData = new Uint8Array([1, 2, 3, 4, 5])

      FS.writeFile(testPath, testData)
      const readData = FS.readFile(testPath)

      expect(readData instanceof Uint8Array).toBe(true)
      expect(readData.length).toBe(5)
      expect(readData[0]).toBe(1)
      expect(readData[4]).toBe(5)

      FS.unlink(testPath)
    })
  })

  describe('单例模式测试', () => {
    test('应该能够多次初始化（测试单例模式）', async () => {
      const { getUnrarModule: testGetUnrarModule } = await import('./helpers/unrar-web-loader')
      const unrar1 = await testGetUnrarModule()
      const unrar2 = await testGetUnrarModule()

      // 验证返回的是同一个实例
      expect(unrar1).toBe(unrar2)
      expect(unrar1).toBe(unrar)
    })
  })
})
