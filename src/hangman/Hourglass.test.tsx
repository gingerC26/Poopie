import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Hourglass from './Hourglass'

describe('Hourglass', () => {
  it('shows Ready when the countdown is finished', () => {
    render(<Hourglass remainingMs={0} />)
    expect(screen.getByText('Ready')).toBeInTheDocument()
    expect(document.querySelector('.hourglass--ready')).toBeTruthy()
    expect(document.querySelector('.hourglass--flowing')).toBeNull()
  })

  it('formats remaining time as m:ss and shows flowing sand', () => {
    render(<Hourglass remainingMs={65_000} />)
    expect(screen.getByText('1:05')).toBeInTheDocument()
    expect(document.querySelector('.hourglass--flowing')).toBeTruthy()
    expect(document.querySelector('.hourglass-stream')).toBeTruthy()
  })
})
