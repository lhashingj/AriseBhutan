/**
 * Rendering tests for the ThemeToggle component and ThemeProvider wiring.
 * Run with: npx vitest run
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ThemeProvider from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'

beforeEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.classList.remove('dark', 'light')
})

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe('ThemeToggle', () => {
  it('renders an accessible toggle button', () => {
    renderToggle()
    const btn = screen.getByRole('button')
    expect(btn).toBeTruthy()
    expect(btn.getAttribute('aria-label')).toMatch(/switch to (light|dark) mode/i)
  })

  it('defaults to light mode (Sun visible, aria points to dark)', () => {
    renderToggle()
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toBe('Switch to dark mode')
  })

  it('switches to dark mode on click and updates the html class', async () => {
    renderToggle()
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    // next-themes applies the class attribute on <html>
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(btn.getAttribute('aria-label')).toBe('Switch to light mode')
  })

  it('toggles back to light mode on second click', () => {
    renderToggle()
    const btn = screen.getByRole('button')
    fireEvent.click(btn) // -> dark
    fireEvent.click(btn) // -> light
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
