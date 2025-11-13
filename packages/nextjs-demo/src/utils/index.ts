export function formatFileSize(bytes: number | bigint): string {
  const size = typeof bytes === 'bigint' ? Number(bytes) : bytes
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0

  let fileSize = size
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }

  return `${fileSize.toFixed(2)} ${units[unitIndex]}`
}
