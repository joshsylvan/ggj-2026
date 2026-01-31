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

  public setIsReady(value: boolean) {
    this._isReady = value;
    this.ledState = value;
  }

  public isReady(): boolean {
    return this._isReady;
  }

  public hasBuzzed(buzzed: boolean): void {
    this._isReady = buzzed;
    this.ledState = buzzed;
  }

  public mapSoundEffect(button: ButtonName, soundEffect: keyof typeof sound): void {
    this.soundEffects.set(button, soundEffect);
  }

  public getSoundEffect(button: ButtonName): keyof typeof sound | undefined {
    return this.soundEffects.get(button);
  }

  public getLedState(): boolean {
    return this.ledState;
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
