export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="px-6 py-6 text-center text-gray-500">
        <p className="text-xs mb-1">
          Powered by{' '}
          <a href="https://www.rarlab.com/" className="text-blue-600 hover:text-blue-700">
            UnRAR
          </a>{' '}
          and{' '}
          <a href="https://webassembly.org/" className="text-blue-600 hover:text-blue-700">
            WebAssembly
          </a>
        </p>
        <p className="text-xs">All processing happens locally. Your files never leave your device.</p>
      </div>
    </footer>
  )
}

