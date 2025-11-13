import { ExtractedFile } from '@/hooks/useUnrarExtractor'
import { formatFileSize } from '@/utils'

interface ResultsSectionProps {
  files: ExtractedFile[]
}

function isTextFile(data: Uint8Array): boolean {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(data)
    // Check if it's really text (no control characters except newlines/tabs/carriage returns)
    return !/[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(text)
  } catch {
    return false
  }
}

function getTextContent(data: Uint8Array): string {
  try {
    return new TextDecoder('utf-8').decode(data)
  } catch {
    return ''
  }
}

export default function ResultsSection({ files }: ResultsSectionProps) {
  const downloadFile = (file: ExtractedFile) => {
    if (!file.data) return

    const blob = new Blob([file.data.slice()])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Extracted Files</h3>
      <div className="space-y-3">
        {files.map((file, index) => {
          const isText = file.data && !file.isDirectory ? isTextFile(file.data) : false
          const textContent = isText && file.data ? getTextContent(file.data) : ''

          return (
            <div key={index} className="border border-gray-200 rounded overflow-hidden">
              {file.isDirectory ? (
                <div className="p-3 bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">📁</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">(directory)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 p-3 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-xl mr-2">📄</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      {file.data && (
                        <button
                          onClick={() => downloadFile(file)}
                          className="ml-3 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium rounded transition-colors flex-shrink-0"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                  {file.data && (
                    <div className="p-3 bg-white">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">File Content:</div>
                      {isText ? (
                        <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                          {textContent}
                        </pre>
                      ) : (
                        <div className="text-gray-500 italic text-sm">Binary file (cannot display as text)</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
