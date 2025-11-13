interface LoadingProgressProps {
  progress: number
  message?: string
}

export default function LoadingProgress({ progress, message = 'Loading...' }: LoadingProgressProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 mb-4">
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-700">{message}</span>
          <span className="text-gray-500 font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">Downloading WebAssembly module...</p>
    </div>
  )
}

