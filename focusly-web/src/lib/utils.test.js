import { describe, it, expect } from 'vitest'
import { getInitials, priorityClass, statusClass, statusLabel } from './utils'

describe('utils', () => {
  it('getInitials extracts first two initials uppercase', () => {
    expect(getInitials('Jane Doe')).toBe('JD')
    expect(getInitials('John')).toBe('J')
    expect(getInitials('Alice Bob Charlie')).toBe('AB')
  })

  it('priorityClass returns correct badge class', () => {
    expect(priorityClass('high')).toBe('badge-high')
    expect(priorityClass('medium')).toBe('badge-medium')
    expect(priorityClass('low')).toBe('badge-low')
  })

  it('statusLabel formats status strings', () => {
    expect(statusLabel('in_progress')).toBe('In Progress')
    expect(statusLabel('done')).toBe('Done')
    expect(statusLabel('todo')).toBe('To Do')
  })
})
