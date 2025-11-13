import { StatusType } from '@/app/page'

interface StatusBannerProps {
  message: string
  type: StatusType
  onClose: () => void
}

export default function StatusBanner({ message, type, onClose }: StatusBannerProps) {
  const colors = {
    info: 'bg-blue-50 border-blue-300 text-blue-900',
    success: 'bg-green-50 border-green-300 text-green-900',
    error: 'bg-red-50 border-red-300 text-red-900',
  }

  return (
    <div className={`p-3 border ${colors[type]} flex items-center justify-between mb-4 text-sm`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-4 text-current opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  )
}
