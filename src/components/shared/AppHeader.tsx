import { BellIcon } from 'lucide-react'

interface AppHeaderProps {
  title?: string
}

export function AppHeader({ title = 'Posyandu Care' }: AppHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 max-w-md mx-auto
                 flex items-center justify-between bg-white px-4"
      style={{ height: '48px' }}
    >
      <span className="font-semibold text-base text-brand-teal">{title}</span>
      <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
        <BellIcon className="w-5 h-5 text-gray-400" />
      </button>
    </header>
  )
}
