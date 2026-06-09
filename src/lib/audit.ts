import { createAdminClient } from '@/lib/supabase/admin'

export type AuditAction = 'insert' | 'update' | 'delete' | 'view'

/**
 * Append a row to audit_log. audit_log has no client INSERT policy (only staff
 * read), so writes go through the service-role client from server context.
 * Best-effort: never throws into the caller's happy path.
 */
export async function logAudit(entry: {
  actor_id: string | null
  actor_role: string | null
  action: AuditAction
  entity: string
  entity_id?: string | null
  diff?: Record<string, unknown> | null
}): Promise<void> {
  try {
    const admin = createAdminClient()
    if (!admin) return
    await admin.from('audit_log').insert({
      actor_id: entry.actor_id,
      actor_role: entry.actor_role,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id ?? null,
      diff: entry.diff ?? null,
    })
  } catch {
    // auditing must not break the operation it records
  }
}
