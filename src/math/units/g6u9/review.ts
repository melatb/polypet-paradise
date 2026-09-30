import type { QuestionType, Zone } from '../../types'

/** Every question type from the given worlds, labeled with its world, for the Grand Review. */
export function reviewQuestionTypes(zones: Zone[]): QuestionType[] {
  return zones.flatMap((z) => z.questionTypes.map((t) => ({ ...t, id: `${z.id}:${t.id}`, name: `${t.name} (${z.short})` })))
}
