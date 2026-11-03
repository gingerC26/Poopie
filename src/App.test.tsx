import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the hangman home at the root and unknown paths', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByLabelText('Letter keyboard')).toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={['/not-a-page']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByLabelText('Letter keyboard')).toBeInTheDocument()
  })
})
