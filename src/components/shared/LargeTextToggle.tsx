'use client'

import { useEffect, useState } from 'react'
import { TypeIcon } from 'lucide-react'

const KEY = 'posyandu-bigger-text'

export function LargeTextToggle() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(KEY) === '1'
    setOn(saved)
    document.documentElement.classList.toggle('bigger-text', saved)
  }, [])

  const toggle = () => {
    const next = !on
    setOn(next)
    document.documentElement.classList.toggle('bigger-text', next)
    localStorage.setItem(KEY, next ? '1' : '0')
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label="Perbesar teks"
      title="Perbesar teks"
      className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${on ? 'bg-brand-light' : ''}`}
    >
      <TypeIcon className="w-5 h-5 text-gray-500" aria-hidden />
    </button>
  )
}
