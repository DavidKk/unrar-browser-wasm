import { useRef, useState } from 'react'

import { formatFileSize } from '@/utils'

interface UploadCardProps {
  selectedFile: File | null
  isExtracting: boolean
  moduleLoaded: boolean
  onFileSelect: (file: File) => void
  onExtract: () => void
  onClear: () => void
}

export default function UploadCard({ selectedFile, isExtracting, moduleLoaded, onFileSelect, onExtract, onClear }: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.rar')) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="bg-white border border-gray-200 p-4 mb-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Select RAR File</h2>
        <p className="text-xs text-gray-600">Files stay in your browser, nothing is uploaded</p>
      </div>

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed p-8 text-center cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".rar" className="hidden" onChange={handleFileChange} />
          <p className="text-sm font-medium text-gray-700">
            Drop RAR file here or <span className="text-blue-600">browse</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">.rar files up to 100MB</p>
        </div>
      ) : (
        <>
          <div className="p-3 bg-gray-50 border border-gray-200 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button onClick={onClear} className="text-gray-400 hover:text-gray-600 text-lg">
                ×
              </button>
            </div>
          </div>

          <button
            onClick={onExtract}
            disabled={!moduleLoaded || isExtracting}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isExtracting ? 'Extracting...' : 'Extract Files'}
          </button>
        </>
      )}
    </div>
  )
}
