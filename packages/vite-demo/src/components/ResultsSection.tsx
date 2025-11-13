import { ExtractedFile } from '../hooks/useUnrarExtractor'
import { formatFileSize } from '../utils'

interface ResultsSectionProps {
  files: ExtractedFile[]
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
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{file.isDirectory ? 'Directory' : formatFileSize(file.size)}</p>
            </div>
            {!file.isDirectory && file.data && (
              <button onClick={() => downloadFile(file)} className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium">
                Download
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
