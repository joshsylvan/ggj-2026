import type { ButtonName } from './state';
import type { soundEffectMap as sound } from './sound-effects';

class playerState {
  constructor(controllerId: number) {
    this._isReady = false;
    this.soundEffects = new Map<ButtonName, keyof typeof sound>();
    this.controllerId = controllerId;
  }

  protected controllerId: number;
  protected _isReady: boolean;
  protected soundEffects: Map<ButtonName, keyof typeof sound>;
  protected ledState: boolean = false;
  protected previousBuzzState: boolean = false;
  protected previousButtonStates: Map<ButtonName, boolean> = new Map();

  public setIsReady(value: boolean) {
    this._isReady = value;
    this.ledState = value;
  }

  public isReady(): boolean {
    return this._isReady;
  }

  public hasBuzzed(buzzed: boolean): boolean {
    this._isReady = buzzed;
    this.ledState = buzzed;
    return buzzed;
  }

  /**
   * Check if the buzz button was just released (was pressed, now released)
   */
  public hasReleasedBuzz(buzzed: boolean): boolean {
    const wasPressed = this.previousBuzzState;
    this.previousBuzzState = buzzed;
    // Only update LED if button is pressed (don't turn off - let scene control that)
    if (buzzed) {
      this.ledState = true;
    }
    return wasPressed && !buzzed;
  }

  /**
   * Check if a colored button was just pressed (was not pressed, now pressed)
   */
  public hasButtonPressed(button: ButtonName, isPressed: boolean): boolean {
    const wasPressed = this.previousButtonStates.get(button) ?? false;
    this.previousButtonStates.set(button, isPressed);
    return !wasPressed && isPressed;
  }

  public setSoundEffect(soundEffect: keyof typeof sound): boolean {
    const buttons: ButtonName[] = ['blue', 'orange', 'green', 'yellow'];
    for (const btn of buttons) {
      if (!this.soundEffects.has(btn)) {
        console.log(
          `Assigning sound effect ${soundEffect} to controller ${this.controllerId} button ${btn}`
        );
        this.soundEffects.set(btn, soundEffect);
        return true;
      }
    }
    return false;
  }

  public getSoundEffect(button: ButtonName): keyof typeof sound | undefined {
    return this.soundEffects.get(button);
  }

  /**
   * Get the number of remaining sound effect slots (out of 4)
   */
  public getRemainingSlots(): number {
    const buttons: ButtonName[] = ['blue', 'orange', 'green', 'yellow'];
    return buttons.filter((btn) => !this.soundEffects.has(btn)).length;
  }

  /**
   * Check if the player is ready (all 4 sound effects assigned)
   */
  public isPlayerReady(): boolean {
    return this.getRemainingSlots() === 0;
  }

  public getLedState(): boolean {
    // LED is on when player is ready (all 4 sounds assigned) or when buzzer is pressed
    return this.isPlayerReady() || this.ledState;
  }

  setLedState(state: boolean): void {
    this.ledState = state;
  }

  public reset(): void {
    this._isReady = false;
    this.soundEffects.clear();
    this.ledState = false;
    this.previousBuzzState = false;
    this.previousButtonStates.clear();
  }
}

const PlayerStates: Map<number, playerState> = new Map();

export function getPlayerState(controllerId: number): playerState {
  if (!PlayerStates.has(controllerId)) {
    PlayerStates.set(controllerId, new playerState(controllerId));
  }
  return PlayerStates.get(controllerId) as playerState;
}

export function getAllPlayerStates(): Map<number, playerState> {
  return PlayerStates;
}

export function updateLedState(): void {
  window.buzz.setLED(
    getPlayerState(0).getLedState(),
    getPlayerState(1).getLedState(),
    getPlayerState(2).getLedState(),
    getPlayerState(3).getLedState()
  );
}
