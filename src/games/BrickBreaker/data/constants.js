export const SLUG = 'brick-breaker'

// The playfield has a fixed logical size. The canvas only scales it, so resizing never changes the physics.
export const WORLD_W = 560
export const WORLD_H = 720
export const MAX_DT = 0.05
export const SUBSTEP = 4 // furthest a ball travels between collision checks

export const COLS = 11
export const BRICK_GAP = 4
export const SIDE = 14
export const BRICK_W = (WORLD_W - SIDE * 2 - BRICK_GAP * (COLS - 1)) / COLS
export const BRICK_H = 20
export const ROW_PITCH = BRICK_H + BRICK_GAP
export const BRICK_TOP = 52

export const PADDLE_Y = 656 // top edge
export const PADDLE_H = 14
export const PADDLE_KEY_SPEED = 620
export const BALL_R = 7
export const MAX_BALLS = 9
export const SHIELD_Y = 694
export const DANGER_Y = PADDLE_Y - 130 // Endless: bricks reaching this line cost a life

export const MAX_LIVES = 9
export const TIME_LIMIT = 120
export const COMBO_WINDOW = 3.5
export const LASER_COOLDOWN = 0.28
export const LASER_SPEED = 760
export const PICKUP_SPEED = 150

export const DIFFICULTIES = {
  easy: { label: 'Easy', hint: 'Slower ball, wider paddle, 5 lives.', ball: 320, paddle: 124, lives: 5, score: 0.75, toughen: 0, drop: 0.12 },
  normal: { label: 'Normal', hint: 'Balanced speed, standard paddle, 3 lives.', ball: 390, paddle: 96, lives: 3, score: 1, toughen: 0, drop: 0.08 },
  hard: { label: 'Hard', hint: 'Faster ball, smaller paddle, tougher bricks.', ball: 465, paddle: 74, lives: 3, score: 1.5, toughen: 0.3, drop: 0.06 },
}

export const MODES = {
  classic: { label: 'Classic', hint: 'Clear all 10 levels.', comboStep: 5, maxMultiplier: 5 },
  endless: { label: 'Endless', hint: 'New rows keep coming. Survive.', comboStep: 5, maxMultiplier: 5 },
  timeAttack: { label: 'Time Attack', hint: '120 seconds. Chain hits for a bigger multiplier.', comboStep: 4, maxMultiplier: 8 },
}

export const CONTROL_METHODS = {
  follow: { label: 'Follow', hint: 'The paddle goes where your mouse or finger is.' },
  drag: { label: 'Drag', hint: 'Swipe anywhere. The paddle moves as far as your finger.' },
  buttons: { label: 'Buttons', hint: 'On-screen arrows on touch devices.' },
}
