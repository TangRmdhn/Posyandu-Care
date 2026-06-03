import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInMonths } from 'date-fns'

// shadcn/ui utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display: "25 Desember 2023"
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMMM yyyy')
}

// Get age as string: "2 Tahun 5 Bulan"
export function getAgeString(tglLahir: string): string {
  const months = differenceInMonths(new Date(), new Date(tglLahir))
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) return `${remainingMonths} Bulan`
  if (remainingMonths === 0) return `${years} Tahun`
  return `${years} Tahun ${remainingMonths} Bulan`
}

// Map nutritional status to badge color
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'Gizi Baik': 'bg-green-100 text-green-800',
    'Gizi Kurang': 'bg-yellow-100 text-yellow-800',
    'Gizi Buruk': 'bg-red-100 text-red-800',
    'Stunting': 'bg-orange-100 text-orange-800',
    'Resiko Tinggi': 'bg-red-200 text-red-900',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}
