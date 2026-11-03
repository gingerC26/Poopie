import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SplineEmbed from './SplineEmbed'

describe('SplineEmbed', () => {
  it('shows setup instructions when no Spline URL is configured', () => {
    render(<SplineEmbed />)
    expect(screen.getByRole('heading', { name: 'Spline scene' })).toBeInTheDocument()
    expect(screen.getByText(/VITE_SPLINE_SCENE_URL/)).toBeInTheDocument()
  })
})
