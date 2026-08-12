// Older itineraries stored each day as one flattened "programme" string
// (title \n description \n "Activities: a, b, c") typed/pasted into a single
// admin textarea. Newer records store title/description/activities as
// separate structured fields (see app/admin/itineraries EditDrawer). This
// normalizes either shape into one object so every renderer — and the admin
// editor itself, when it loads an old record — can work off structured data.
export function parseDayProgramme(day) {
  if (day?.title) {
    return {
      title:       day.title,
      description: day.description || null,
      activities:  Array.isArray(day.activities) ? day.activities.filter(Boolean) : [],
    }
  }

  const lines = (day?.programme || '').split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return { title: null, description: null, activities: [] }

  const title = lines[0]
  const activitiesIdx = lines.findIndex((l, i) => i > 0 && /^activities:\s*/i.test(l))
  const activities = activitiesIdx >= 0
    ? lines[activitiesIdx].replace(/^activities:\s*/i, '').split(',').map(s => s.trim()).filter(Boolean)
    : []
  const descLines = lines.slice(1).filter((_, i) => i + 1 !== activitiesIdx)
  const description = descLines.length ? descLines.join('\n') : null

  return { title, description, activities }
}
