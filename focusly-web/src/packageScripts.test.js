import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const packageJsonPath = path.resolve(process.cwd(), 'package.json')

describe('package scripts', () => {
  it('exposes a start script for launching the Vite dev server', () => {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    expect(pkg.scripts.start).toBeTruthy()
    expect(pkg.scripts.start).toContain('vite')
  })
})
