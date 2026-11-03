import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { lettersIn } from '../hangman/levels'
import Home from './Home'

describe('Home', () => {
  it('starts on hangman with locked level names', () => {
    render(<Home />)
    expect(screen.getByLabelText('Letter keyboard')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1\. \?+/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xiao long bao' })).not.toBeInTheDocument()
  })

  it('unlocks Careful and shows the dumpling scene after solving the word', async () => {
    const user = userEvent.setup()
    render(<Home />)
    for (const letter of lettersIn('CAREFUL')) {
      await user.click(screen.getByRole('button', { name: letter }))
    }
    expect(screen.getByRole('heading', { name: 'Careful' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xiao long bao' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1\. Careful/ })).toBeInTheDocument()
  })
})
