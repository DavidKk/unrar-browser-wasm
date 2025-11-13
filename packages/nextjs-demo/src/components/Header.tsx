export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">UnRAR Browser (Next.js Demo)</h1>
            <p className="text-xs text-gray-500 mt-0.5">Extract RAR files in your browser</p>
          </div>
          <a href="https://github.com/DavidKk/unrar-browser-wasm" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900">
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}

