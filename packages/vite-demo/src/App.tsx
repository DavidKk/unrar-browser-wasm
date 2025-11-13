import { useCallback, useEffect, useState } from 'react'

import Footer from './components/Footer'
import Header from './components/Header'
import LoadingProgress from './components/LoadingProgress'
import ResultsSection from './components/ResultsSection'
import StatusBanner from './components/StatusBanner'
import UploadCard from './components/UploadCard'
import { useUnrarExtractor } from './hooks/useUnrarExtractor'
import { useUnrarModule } from './hooks/useUnrarModule'

export type StatusType = 'info' | 'success' | 'error'

function App() {
  const { module: unrarModule, loading: moduleLoading, progress: loadingProgress, error: moduleError } = useUnrarModule()
  const { extractedFiles, isExtracting, error: extractError, extract, clear } = useUnrarExtractor(unrarModule)
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: StatusType } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const showStatus = useCallback((message: string, type: StatusType) => {
    setStatusMessage({ message, type })
    if (type === 'success' || type === 'info') {
      setTimeout(() => setStatusMessage(null), 5000)
    }
  }, [])

  useEffect(() => {
    if (moduleError) {
      showStatus(`Failed to load UnRAR module: ${moduleError.message}`, 'error')
    } else if (unrarModule && !moduleLoading) {
      showStatus('UnRAR module loaded successfully! Ready to extract files.', 'success')
    }
  }, [moduleLoading, moduleError, unrarModule, showStatus])

  useEffect(() => {
    if (extractError) {
      showStatus(`Extraction failed: ${extractError.message}`, 'error')
    } else if (extractedFiles.length > 0) {
      showStatus(`Successfully extracted ${extractedFiles.length} file(s)!`, 'success')
    }
  }, [extractError, extractedFiles.length, showStatus])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    clear()
  }

  const handleExtract = async () => {
    if (!selectedFile) return
    showStatus('Extracting files...', 'info')
    await extract(selectedFile)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {moduleLoading && <LoadingProgress progress={loadingProgress} message="Loading UnRAR WASM Module" />}
        {statusMessage && <StatusBanner message={statusMessage.message} type={statusMessage.type} onClose={() => setStatusMessage(null)} />}
        <UploadCard
          selectedFile={selectedFile}
          isExtracting={isExtracting}
          moduleLoaded={!!unrarModule}
          onFileSelect={handleFileSelect}
          onExtract={handleExtract}
          onClear={() => {
            setSelectedFile(null)
            clear()
          }}
        />
        {extractedFiles.length > 0 && <ResultsSection files={extractedFiles} />}
      </main>
      <Footer />
    </div>
  )
}

export default App
