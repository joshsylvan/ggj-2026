import type { BuzzerState } from './types/buzz';

export type ButtonName = 'buzz' | 'blue' | 'orange' | 'green' | 'yellow';

export interface ButtonEvent {
  controller: number;
  button: ButtonName;
  pressed: boolean;
}

export type ButtonEventHandler = (event: ButtonEvent) => void;

const BUTTON_NAMES: ButtonName[] = ['buzz', 'blue', 'orange', 'green', 'yellow'];

const createEmptyBuzzerState = (): BuzzerState => ({
  buzz: false,
  blue: false,
  orange: false,
  green: false,
  yellow: false,
  led: false,
});

class BuzzState {
  private previousState: [BuzzerState, BuzzerState, BuzzerState, BuzzerState];
  private currentState: [BuzzerState, BuzzerState, BuzzerState, BuzzerState];
  private onPressHandlers: ButtonEventHandler[] = [];
  private onReleaseHandlers: ButtonEventHandler[] = [];
  private onChangeHandlers: ButtonEventHandler[] = [];

  constructor() {
    this.previousState = [
      createEmptyBuzzerState(),
      createEmptyBuzzerState(),
      createEmptyBuzzerState(),
      createEmptyBuzzerState(),
    ];
    this.currentState = [
      createEmptyBuzzerState(),
      createEmptyBuzzerState(),
      createEmptyBuzzerState(),
      createEmptyBuzzerState(),
    ];
  }

  /**
   * Update state with new data from the buzz controller
   * Returns array of button events that occurred
   */
  update(newState: [BuzzerState, BuzzerState, BuzzerState, BuzzerState]): ButtonEvent[] {
    const events: ButtonEvent[] = [];

    for (let controller = 0; controller < 4; controller++) {
      for (const button of BUTTON_NAMES) {
        const wasPressed = this.currentState[controller][button];
        const isPressed = newState[controller][button];

        if (wasPressed !== isPressed) {
          const event: ButtonEvent = {
            controller,
            button,
            pressed: isPressed,
          };
          events.push(event);

          // Fire handlers
          this.onChangeHandlers.forEach((handler) => handler(event));
          if (isPressed) {
            this.onPressHandlers.forEach((handler) => handler(event));
          } else {
            this.onReleaseHandlers.forEach((handler) => handler(event));
          }
        }
      }
    }

    // Update state references
    this.previousState = this.currentState;
    this.currentState = newState;

    return events;
  }

  /**
   * Get the current state of all controllers
   */
  getState(): [BuzzerState, BuzzerState, BuzzerState, BuzzerState] {
    return this.currentState;
  }

  getPreviousState(): [BuzzerState, BuzzerState, BuzzerState, BuzzerState] {
    return this.previousState;
  }
}

// Singleton instance
export const buzzState = new BuzzState();

export const GAME_STATE_TUTORIAL = 0;
export const GAME_STATE_SOUND_SELECT = 1;
export const GAME_STATE_GAME = 2;
let gameState = GAME_STATE_TUTORIAL;
export const getGameState = () => gameState;
export const setGameState = (state: number) => gameState = state;



/**
 * Poll the buzz controller and update state
 * Call this once per frame in your game loop
 */
export async function getBuzzState(): Promise<ButtonEvent[]> {
  const state = await window.buzz.getState();
  return buzzState.update(state);
}
