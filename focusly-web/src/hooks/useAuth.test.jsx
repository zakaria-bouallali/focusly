import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './useAuth'

const mockGet = vi.fn()
const mockPost = vi.fn()

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const api = await import('../lib/api')

function LoginButton() {
  const { login } = useAuth()

  return <button onClick={() => login('test@example.com', 'password123')}>login</button>
}

describe('useAuth login', () => {
  beforeEach(() => {
    api.default.get.mockReset()
    api.default.post.mockReset()
    localStorage.clear()
  })

  it('fetches the CSRF cookie before logging in', async () => {
    api.default.get.mockResolvedValue({})
    api.default.post.mockResolvedValue({ data: { user: { id: 1, name: 'Test User', email: 'test@example.com' }, token: 'token' } })

    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    )

    screen.getByRole('button', { name: /login/i }).click()

    await waitFor(() => expect(api.default.get).toHaveBeenCalledWith('/sanctum/csrf-cookie', { baseURL: '/' }))
    expect(api.default.post).toHaveBeenCalledWith('/login', { email: 'test@example.com', password: 'password123' })
  })
})
