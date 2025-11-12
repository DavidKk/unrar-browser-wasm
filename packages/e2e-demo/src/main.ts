import { getUnrarModule } from '@unrar-browser/core'

interface UnrarModule {
  Archive: any
  CommandData: any
  setPassword: (password: string) => void
  FS: any
  HeaderType: {
    HEAD_FILE: number
    HEAD_ENDARC: number
  }
}

interface ExtractedFile {
  name: string
  size: number
  isDirectory: boolean
  content: any | null
}

const moduleStatus = document.getElementById('moduleStatus')!
const statusMessage = document.getElementById('statusMessage')!
const consoleOutput = document.getElementById('consoleOutput')!
const results = document.getElementById('results')!
const extractedFiles = document.getElementById('extractedFiles')!

let unrarModule: UnrarModule | null = null

type LogType = 'info' | 'success' | 'error' | 'warn' | 'debug'

function log(message: string, type: LogType = 'info'): void {
  const timestamp = new Date().toLocaleTimeString()
  const logEntry = document.createElement('div')

  const colors: Record<LogType, string> = {
    info: 'text-blue-400',
    success: 'text-green-400',
    error: 'text-red-400',
    warn: 'text-yellow-400',
    debug: 'text-gray-400',
  }

  logEntry.className = colors[type]
  logEntry.textContent = `[${timestamp}] [${type}] ${message}`
  consoleOutput.appendChild(logEntry)
  consoleOutput.scrollTop = consoleOutput.scrollHeight
  console.log(`[${type}]`, message)
}

function showStatus(message: string, type: 'info' | 'success' | 'error'): void {
  statusMessage.textContent = message
  statusMessage.classList.remove('hidden')

  const styles: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  statusMessage.className = `status ${type} p-3 border rounded mb-4 text-sm ${styles[type]}`
}

function formatFileSize(bytes: number | bigint): string {
  const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (numBytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(numBytes) / Math.log(k))
  return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

async function loadUnrarModule(): Promise<void> {
  try {
    log('Starting to load UnRAR WASM module', 'info')
    // 从 Vite 环境变量获取 base URL（如果可用）
    const basePath = typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL 
      ? (import.meta as any).env.BASE_URL 
      : '/'
    unrarModule = await getUnrarModule(basePath)
    log('UnRAR WASM module loaded successfully', 'success')
    moduleStatus.textContent = 'UnRAR WASM module loaded successfully ✓'
    moduleStatus.className = 'p-3 bg-green-50 border border-green-200 rounded mb-4 text-sm text-green-800'

    await autoTestExtraction()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log('Failed to load UnRAR WASM module: ' + errorMessage, 'error')
    moduleStatus.textContent = 'Failed to load UnRAR WASM module ✗'
    moduleStatus.className = 'p-3 bg-red-50 border border-red-200 rounded mb-4 text-sm text-red-800'
  }
}

async function autoTestExtraction(): Promise<void> {
  try {
    log('=== Starting automatic test ===', 'info')
    log('Loading q.rar file...', 'info')

    const response = await fetch('/q.rar')
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    log(`File loaded successfully, size: ${formatFileSize(arrayBuffer.byteLength)}`, 'info')

    await extractRarFile(arrayBuffer)

    log('=== Automatic test completed ===', 'success')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log('Automatic test failed: ' + errorMessage, 'error')
    console.error('Automatic test error:', error)
  }
}

async function extractRarFile(arrayBuffer: ArrayBuffer): Promise<void> {
  if (!unrarModule) {
    showStatus('UnRAR WASM module not loaded', 'error')
    return
  }

  try {
    showStatus('Extracting files...', 'info')
    log('Initializing archive object...', 'info')

    const FS = unrarModule.FS
    const fileName = '/temp.rar'

    log('Writing file to virtual file system: ' + fileName, 'info')
    FS.writeFile(fileName, new Uint8Array(arrayBuffer))
    log('File written to virtual file system', 'info')

    const cmdData = new unrarModule.CommandData()
    log('CommandData object created successfully', 'info')

    const archive = new unrarModule.Archive(cmdData)
    log('Archive object created successfully', 'info')

    const isOpened = archive.openFile(fileName)
    if (!isOpened) {
      FS.unlink(fileName)
      throw new Error('Cannot open RAR file')
    }
    log('File opened successfully', 'info')

    const isValid = archive.isArchive(true)
    if (!isValid) {
      FS.unlink(fileName)
      throw new Error('Not a valid RAR file')
    }
    log('Valid RAR file', 'info')

    const files: ExtractedFile[] = []
    let headerSize: number
    while ((headerSize = archive.readHeader()) > 0) {
      const headerType = archive.getHeaderType()

      if (headerType === unrarModule.HeaderType.HEAD_FILE) {
        const extractedFileName = archive.getFileName()
        const fileSize = archive.getFileSize()
        const isDir = archive.isDirectory()

        log(`Found file: ${extractedFileName}`, 'info')

        let fileContent = null
        if (!isDir) {
          log(`Reading file ${extractedFileName} content, expected size: ${fileSize}`, 'debug')
          const fileData = archive.readFileData()
          const size = fileData.size()
          log(`Read file ${extractedFileName}, actual size: ${size} bytes`, 'info')

          if (size > 0) {
            let preview = 'First 10 bytes: '
            for (let i = 0; i < Math.min(10, size); i++) {
              preview += fileData.get(i).toString(16).padStart(2, '0') + ' '
            }
            log(preview, 'debug')
          } else {
            log('Warning: Read data size is 0!', 'warn')
          }

          fileContent = fileData
        }

        files.push({
          name: extractedFileName,
          size: fileSize,
          isDirectory: isDir,
          content: fileContent,
        })
      } else if (headerType === unrarModule.HeaderType.HEAD_ENDARC) {
        log('Reached end of archive', 'info')
        break
      }

      archive.seekToNext()
    }

    FS.unlink(fileName)

    showRealExtractedFiles(files)

    showStatus('RAR file extracted successfully!', 'success')
    log('RAR file extracted successfully', 'info')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log('Extraction failed: ' + errorMessage, 'error')
    showStatus('Extraction failed: ' + errorMessage, 'error')
    console.error('Extraction error:', error)
    throw error
  }
}

function showRealExtractedFiles(files: ExtractedFile[]): void {
  results.classList.remove('hidden')
  extractedFiles.innerHTML = ''

  if (files.length === 0) {
    extractedFiles.innerHTML = '<p class="text-gray-500">No files found</p>'
    return
  }

  log(`Total ${files.length} file(s)/directory(ies) extracted`, 'info')

  const fileList = document.createElement('div')
  fileList.className = 'space-y-4'

  files.forEach((file, index) => {
    const fileItem = document.createElement('div')
    fileItem.className = 'border border-gray-200 rounded-lg overflow-hidden'

    if (file.isDirectory) {
      log(`[${index + 1}] 📁 ${file.name} (directory)`, 'info')
      fileItem.innerHTML = `
        <div class="p-4 bg-gray-50">
          <div class="flex items-center">
            <span class="text-2xl mr-3">📁</span>
            <div>
              <strong class="text-lg">${escapeHtml(file.name)}</strong>
              <div class="text-xs text-gray-500 mt-1">(directory)</div>
            </div>
          </div>
        </div>
      `
    } else {
      const size = formatFileSize(file.size)
      log(`[${index + 1}] 📄 ${file.name} - ${size}`, 'info')

      if (file.content && file.content.size() > 0) {
        const contentSize = file.content.size()
        log(`  Content size: ${contentSize} bytes`, 'info')

        // Convert to text
        let textContent = ''
        let isTextFile = true
        try {
          const bytes = new Uint8Array(Array.from({ length: contentSize }, (_, i) => file.content.get(i)))
          textContent = new TextDecoder('utf-8').decode(bytes)
          log(`  Text content: ${textContent}`, 'info')

          // Check if it's really text (no control characters except newlines/tabs)
          isTextFile = !/[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(textContent)
        } catch (e) {
          log('  (Binary file, cannot display as text)', 'debug')
          isTextFile = false
        }

        // Hex preview for logs
        let hexPreview = '  First 50 bytes (hex): '
        const previewLen = Math.min(50, contentSize)
        for (let i = 0; i < previewLen; i++) {
          hexPreview += file.content.get(i).toString(16).padStart(2, '0') + ' '
        }
        log(hexPreview, 'debug')

        fileItem.innerHTML = `
          <div class="bg-blue-50 p-4 border-b border-blue-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center flex-1">
                <span class="text-2xl mr-3">📄</span>
                <div>
                  <strong class="text-lg">${escapeHtml(file.name)}</strong>
                  <div class="text-xs text-gray-600 mt-1">${size} · ${contentSize} bytes</div>
                </div>
              </div>
              <button onclick="downloadFile('${escapeHtml(file.name)}', ${index})" class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                Download
              </button>
            </div>
          </div>
          <div class="p-4 bg-white">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">File Content:</div>
            ${
              isTextFile
                ? `
              <pre class="bg-gray-50 p-4 rounded border border-gray-200 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words">${escapeHtml(textContent)}</pre>
            `
                : `
              <div class="text-gray-500 italic">Binary file (cannot display as text)</div>
            `
            }
          </div>
        `
      } else {
        log(`  ⚠️ Warning: Content is empty!`, 'warn')
        fileItem.innerHTML = `
          <div class="p-4 bg-red-50 border-red-100">
            <div class="flex items-center">
              <span class="text-2xl mr-3">📄</span>
              <div>
                <strong class="text-lg">${escapeHtml(file.name)}</strong>
                <div class="text-xs text-red-600 mt-1">⚠️ Empty content</div>
              </div>
            </div>
          </div>
        `
      }
    }

    fileList.appendChild(fileItem)
  })

  extractedFiles.appendChild(fileList)

  // Store files for download
  ;(window as any).extractedFiles = files
}

// Global download function
;(window as any).downloadFile = (fileName: string, index: number) => {
  const files = (window as any).extractedFiles as ExtractedFile[]
  const file = files[index]
  if (!file || !file.content) return

  const size = file.content.size()
  const uint8Array = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    uint8Array[i] = file.content.get(i)
  }

  const blob = new Blob([uint8Array])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  log(`File ${fileName} downloaded successfully`, 'info')
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

document.addEventListener('DOMContentLoaded', () => {
  log('Page loaded, starting to load UnRAR WASM module', 'info')
  loadUnrarModule()
})
