//******************** */
// HANGMAN SETTINGS
//******************** */

/** Hourglass countdown after a guess starts a round. */
export const COOLDOWN_MS = 60 * 1000
// default: 60 * 1000

//******************** */
// CAREFUL SETTINGS
//******************** */

/** Corridor half-width as % of the Careful background. Lower is harder. The dumpling is 6.4% wide. */
export const XLB_PATH_HALF_WIDTH = 7.15
// default: 4.15

/** How long the dumpling cries soup after hitting a wall, before reset. */
export const XLB_SPILL_MS = 5 * 1000
// default: 5 * 1000

//******************** */
// TWENTY SECONDS SETTINGS
//******************** */

/** Offset of time difference allowed in twenty seconds game. */
export const TWENTY_SECONDS_OFFSET_MS = 10 * 1000
// default: 0 * 1000

/** How long a tea-table message stays on screen. */
export const TEA_NOTICE_MS = 3 * 1000
// default: 3 * 1000

/** How many tea-table messages can show at once. */
export const TEA_NOTICE_LIMIT = 3
// default: 3