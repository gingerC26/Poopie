import { describe, expect, it } from 'vitest'
import {
  CLEAR_WIN_RECORDS_BUTTON,
  COOLDOWN_MS,
  HUNTING_TIME_MS,
  PASSWORD_LEVEL_ENABLED,
  XLB_PATH_HALF_WIDTH,
  XLB_SPILL_MS,
} from './settings'

describe('settings', () => {
  it('keeps the hourglass cooldown at one hour', () => {
    expect(COOLDOWN_MS).toBe(60 * 60 * 1000)
  })

  it('hides the Clear win records button', () => {
    expect(CLEAR_WIN_RECORDS_BUTTON).toBe(false)
  })

  it('keeps Password under maintenance', () => {
    expect(PASSWORD_LEVEL_ENABLED).toBe(false)
  })

  it('keeps the spill reset at five seconds', () => {
    expect(XLB_SPILL_MS).toBe(5_000)
  })

  it('gives Hunting a thirty-second round', () => {
    expect(HUNTING_TIME_MS).toBe(30_000)
  })

  it('uses a path half-width thinner than the dumpling body', () => {
    expect(XLB_PATH_HALF_WIDTH).toBeGreaterThan(0)
    expect(XLB_PATH_HALF_WIDTH).toBeLessThan(20)
  })
})
