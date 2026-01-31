export interface BuzzerState {
  buzz: boolean;
  blue: boolean;
  orange: boolean;
  green: boolean;
  yellow: boolean;
  led: boolean;
}

export interface BuzzAPI {
  /**
   * Set the LED state for each of the 4 buzz controllers
   * @param led1 - LED state for controller 1
   * @param led2 - LED state for controller 2
   * @param led3 - LED state for controller 3
   * @param led4 - LED state for controller 4
   */
  setLED: (led1: boolean, led2: boolean, led3: boolean, led4: boolean) => Promise<void>;

  /**
   * Get the current button state for all 4 buzz controllers
   * @returns Array of 4 BuzzerState objects, one for each controller
   */
  getState: () => Promise<[BuzzerState, BuzzerState, BuzzerState, BuzzerState]>;
  onKeyDown: (keycode: string) => Promise<void>,
  onKeyUp: (keycode: string) => Promise<void>,
}

declare global {
  interface Window {
    buzz: BuzzAPI;
  }
}
