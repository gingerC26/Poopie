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

/** Perfect steep time for the twenty seconds game. */
export const TWENTY_SECONDS_TARGET_MS = 20 * 1000
// default: 20 * 1000

/** Offset of time difference allowed in twenty seconds game. */
export const TWENTY_SECONDS_OFFSET_MS = 10000
// default: 200

/** How long a tea-table message stays on screen. */
export const TEA_NOTICE_MS = 3 * 1000
// default: 3 * 1000

/** How many tea-table messages can show at once. */
export const TEA_NOTICE_LIMIT = 3
// default: 3

//******************** */
// PASSWORD SETTINGS
//******************** */

/** How many digits the locker PIN holds. */
export const LOCKER_PIN_LENGTH = 6
// default: 6

/** Correct locker combination. */
export const LOCKER_PIN = '030226'
// default: 030226

/** Folder for locker-camera photos. Drop jpg/png/webp here (1.jpg, 2.jpg, …). */
export const LOCKER_PHOTOS_DIR = 'public/sprites/password/photos'
// default: public/sprites/password/photos

//******************** */
// MEMORY SETTINGS
//******************** */

/** Memory answers, one guess per line. */
export const MEMORY_ANSWERS_PATH = 'public/sprites/memory/answers.txt'
// default: public/sprites/memory/answers.txt

/** Show the Memory Reset button. */
export const MEMORY_RESET_BUTTON = true
// default: false

/** Folder for Memory Hint clips. Drop m4a/mp3/wav here (1.m4a, 2.m4a, …). */
export const MEMORY_HINT_SOUNDS_DIR = 'public/sprites/memory/hints'
// default: public/sprites/memory/hints

/** How long Hint stays disabled after a click. */
export const MEMORY_HINT_COOLDOWN_MS = 5 * 1000
// default: 5 * 1000

/** How long the first-Hint audio nudge stays on screen. */
export const MEMORY_HINT_NUDGE_MS = 5 * 1000
// default: 5 * 1000

//******************** */
// HUNTING SETTINGS
//******************** */

/** Hunting maze width and height in cells. */
export const HUNTING_GRID = 14
// default: 16

/** Manhattan gap (|dx| + |dy|) between the koala and each food. */
export const HUNTING_FOOD_MIN_DISTANCE = 8
// default: 8

/** Hunting round length. */
export const HUNTING_TIME_MS = 30 * 1000
// default: 30 * 1000

/** Folder for Hunting pacman sprites. */
export const HUNTING_SPRITES_DIR = 'public/sprites/hunting'
// default: public/sprites/hunting

//******************** */
// ARCADE SETTINGS
//******************** */

/** Starting checkout total, like a tiny 301. */
export const ARCADE_START_SCORE = 20
// default: 20

/** Throws allowed to reach exactly zero. */
export const ARCADE_DARTS = 5
// default: 5

/** How long one dart flies to the board. */
export const ARCADE_FLIGHT_MS = 1800
// default: 1800

/** Pause while Hit X! blinks twice. */
export const ARCADE_LAND_MS = 1200
// default: 1200