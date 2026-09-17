export class StateError extends Error {}
export function validateState(s) {
  if (!s || s.schema_version !== 1) throw new StateError("unsupported state");
  if (!s.player?.id || !Number.isInteger(s.revision)) throw new StateError("bad metadata");
  for (const [id,r] of Object.entries(s.player.resources ?? {})) {
    if (!Number.isFinite(r.current)||!Number.isFinite(r.max)||r.current<0||r.current>r.max)
      throw new StateError(`resource ${id} outside 0..max`);
  }
  for (const [id,n] of Object.entries(s.player.inventory ?? {}))
    if (!Number.isInteger(n)||n<0) throw new StateError(`invalid item ${id}`);
  for (const [id,c] of Object.entries(s.world.clocks ?? {}))
    if (!Number.isInteger(c.value)||!Number.isInteger(c.segments)||c.value<0||c.value>c.segments)
      throw new StateError(`clock ${id} outside 0..segments`);
  if (!Array.isArray(s.applied_event_ids)||new Set(s.applied_event_ids).size!==s.applied_event_ids.length)
    throw new StateError("bad event ledger");
  return s;
}
