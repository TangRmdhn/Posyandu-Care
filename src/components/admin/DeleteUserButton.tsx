'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { deleteUser, type AssignState } from '@/app/actions/user.actions'

const initial: AssignState = { error: null }

function Submit({ nama }: { nama: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(`Hapus akun "${nama}" secara permanen?`)) e.preventDefault()
      }}
      className="text-xs text-red-500 font-medium disabled:opacity-60"
    >
      {pending ? 'Menghapus...' : 'Hapus'}
    </button>
  )
}

export function DeleteUserButton({ id, nama }: { id: string; nama: string }) {
  const [state, action] = useFormState(deleteUser, initial)

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <Submit nama={nama} />
      {state.error && <span className="text-[11px] text-red-500">{state.error}</span>}
    </form>
  )
}
