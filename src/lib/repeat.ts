import type { Walk } from "./types";
import { newId, nowISO } from "./id";
import { addDays, dayOfWeek, toISODate, parseISODate } from "./date";

// Expand a repeat rule into future walk occurrences for the next N weeks.
// Occurrences share a repeat_group_id so they can be managed as a series.
export function expandRepeats(base: Walk, weeks = 8): Walk[] {
  if (base.repeat_rule === "none") return [];

  const groupId = base.repeat_group_id ?? newId();
  const days =
    base.repeat_rule === "weekly"
      ? [dayOfWeek(base.scheduled_date)]
      : base.repeat_days.length
        ? base.repeat_days
        : [dayOfWeek(base.scheduled_date)];

  const out: Walk[] = [];
  const start = parseISODate(base.scheduled_date);
  // Start the day after the base date so we don't duplicate the original.
  for (let d = 1; d <= weeks * 7; d++) {
    const date = addDays(base.scheduled_date, d);
    if (days.includes(dayOfWeek(date))) {
      out.push({
        ...base,
        id: newId(),
        scheduled_date: date,
        status: "scheduled",
        repeat_group_id: groupId,
        actual_start_time: null,
        cancel_note: "",
        created_at: nowISO(),
        updated_at: nowISO(),
      });
    }
  }
  return out;
}

export function attachGroupId(base: Walk): Walk {
  if (base.repeat_rule === "none") return base;
  return { ...base, repeat_group_id: base.repeat_group_id ?? newId() };
}
