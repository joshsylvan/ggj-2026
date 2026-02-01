import type { ButtonName } from './state';
import { soundEffectMap as sound } from './sound-effects';

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
  protected forceLedOff: boolean = false;
  protected previousBuzzState: boolean = false;
  protected previousButtonStates: Map<ButtonName, boolean> = new Map();
  protected score: number = 0;

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
    if (buzzed) {
      this.ledState = true;
    }
    return wasPressed && !buzzed;
  }

  public hasButtonPressed(button: ButtonName, isPressed: boolean): boolean {
    const wasPressed = this.previousButtonStates.get(button) ?? false;
    this.previousButtonStates.set(button, isPressed);
    return !wasPressed && isPressed;
  }

  public hasButtonReleased(button: ButtonName, isPressed: boolean): boolean {
    const wasPressed = this.previousButtonStates.get(button) ?? false;
    this.previousButtonStates.set(button, isPressed);
    return wasPressed && !isPressed;
  }

  public removeSoundEffect(button: ButtonName): void {
    this.soundEffects.delete(button);
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
    if (this.forceLedOff) return false;
    // LED is on when player is ready (all 4 sounds assigned) or when buzzer is pressed
    return this.isPlayerReady() || this.ledState;
  }

  setLedState(state: boolean): void {
    this.ledState = state;
    this.forceLedOff = false; // Clear force off when explicitly setting state
  }

  setForceLedOff(force: boolean): void {
    this.forceLedOff = force;
  }

  getScore(): number {
    return this.score;
  }

  addSoundEffectToScore(soundEffect: keyof typeof sound, caughtMultiplier: number = 1): void {
    const points = sound[soundEffect].noise * caughtMultiplier;
    this.score += points;
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

export function resetAllLedStates(): void {
  for (let i = 0; i < 4; i++) {
    getPlayerState(i).setForceLedOff(true);
  }
  updateLedState();
}
