import { getPlayerState } from '../player-state';
import { renderBackground } from '../renderBackground';
import {
  type ButtonEmojis,
  controllerImageSrcWidth,
  drawControllerWithEmojis,
} from '../renderControllers';
import { drawSoundEffectToSelect, drawInstructionText } from '../renderSoundEffectIcon';
import {
  getCurrentSoundEffect,
  getEmojiForSoundEffect,
  nextSoundEffect,
  playSoundEffect,
  playSoundEffectByName,
  stopSoundEffect,
  type SoundEffect,
} from '../sound-effects';
import type { BuzzerState } from '../types/buzz';
import { type ButtonName, setGameState, GAME_STATE_GAME } from '../state';

const assignSound = new Audio('sounds/synth-stab.mp3');

export const update = (deltaTime: number) => {};

export const init = (numControllers: number = 4) => {
  // Reset scene state
  currentRenderedSoundEffect = undefined;
  inputFrozenUntil = 0;
  pendingNextSoundEffect = false;
  soundEffectDisplayedAt = 0;
  playerWithLedOn = null;
  gameStartCountdownAt = null;

  // Reset all player states
  for (let i = 0; i < numControllers; i++) {
    getPlayerState(i).reset();
  }
};

let currentRenderedSoundEffect: SoundEffect | undefined = undefined;
let inputFrozenUntil: number = 0;
let pendingNextSoundEffect: boolean = false;
let soundEffectDisplayedAt: number = 0;
let playerWithLedOn: number | null = null;
let gameStartCountdownAt: number | null = null;
const GAME_START_COUNTDOWN_DURATION = 3000; // 3 second countdown before game starts
const COUNTDOWN_START_DELAY = 2000; // 2 seconds before countdown starts
const COUNTDOWN_DURATION = 3000; // 3 second countdown
const FREEZE_DURATION = 1000; // 1 second freeze after claiming a sound

const isInputFrozen = (): boolean => {
  return Date.now() < inputFrozenUntil;
};

const freezeInput = (durationMs: number): void => {
  inputFrozenUntil = Date.now() + durationMs;
};

const getCountdownValue = (): number | undefined => {
  if (soundEffectDisplayedAt === 0) return undefined;
  const elapsed = Date.now() - soundEffectDisplayedAt;
  if (elapsed < COUNTDOWN_START_DELAY) return undefined;
  const countdownElapsed = elapsed - COUNTDOWN_START_DELAY;
  const remaining = Math.ceil((COUNTDOWN_DURATION - countdownElapsed) / 1000);
  return remaining > 0 ? remaining : 0;
};

const isCountdownExpired = (): boolean => {
  if (soundEffectDisplayedAt === 0) return false;
  const elapsed = Date.now() - soundEffectDisplayedAt;
  return elapsed >= COUNTDOWN_START_DELAY + COUNTDOWN_DURATION;
};

const findPlayerToAutoAssign = (buzzState: BuzzerState[]): number | null => {
  const eligiblePlayers: number[] = [];
  for (let i = 0; i < buzzState.length; i++) {
    if (getPlayerState(i).getRemainingSlots() > 0) {
      eligiblePlayers.push(i);
    }
  }
  if (eligiblePlayers.length === 0) return null;
  return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
};

const areAllPlayersReady = (buzzState: BuzzerState[]): boolean => {
  for (let i = 0; i < buzzState.length; i++) {
    if (!getPlayerState(i).isPlayerReady()) {
      return false;
    }
  }
  return true;
};

const getGameStartCountdown = (): number | undefined => {
  if (gameStartCountdownAt === null) return undefined;
  const elapsed = Date.now() - gameStartCountdownAt;
  const remaining = Math.ceil((GAME_START_COUNTDOWN_DURATION - elapsed) / 1000);
  return remaining > 0 ? remaining : 0;
};

const isGameStartCountdownExpired = (): boolean => {
  if (gameStartCountdownAt === null) return false;
  const elapsed = Date.now() - gameStartCountdownAt;
  return elapsed >= GAME_START_COUNTDOWN_DURATION;
};

const renderGameStartCountdown = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const countdown = getGameStartCountdown();
  const centerX = canvas.width / 2;
  ctx.font = '48px Minecraft';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.letterSpacing = '2px';
  if (countdown !== undefined && countdown > 0) {
    ctx.fillText(`Game starts in ${countdown}...`, centerX, 120);
  } else {
    ctx.fillText('GO!', centerX, 120);
  }
};

const renderSoundEffectToSelect = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const centerX = canvas.width / 2;

  // Advance to next sound effect when freeze ends
  if (pendingNextSoundEffect && !isInputFrozen()) {
    // Turn off LED when freeze ends
    if (playerWithLedOn !== null) {
      getPlayerState(playerWithLedOn).setLedState(false);
      playerWithLedOn = null;
    }
    nextSoundEffect();
    pendingNextSoundEffect = false;
    soundEffectDisplayedAt = Date.now(); // Reset timer for new sound
  }

  // Don't display the next sound effect during the freeze period, but keep instruction text
  if (pendingNextSoundEffect && isInputFrozen()) {
    drawInstructionText(centerX, 75, ctx);
    return;
  }

  const currentSoundEffect = getCurrentSoundEffect();
  const countdown = getCountdownValue();
  drawSoundEffectToSelect(centerX, 75, currentSoundEffect, ctx, countdown);

  if (currentRenderedSoundEffect !== currentSoundEffect) {
    currentRenderedSoundEffect = currentSoundEffect;
    soundEffectDisplayedAt = Date.now(); // Start timer when new sound is shown
    playSoundEffect(currentSoundEffect);
  }
};

export const render = async (
  deltaTime: number,
  buzzState: BuzzerState[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  renderBackground(canvas, ctx, ['#ffaa5e', '#ffd4a3']);

  // Check if all players are ready and start game countdown
  if (areAllPlayersReady(buzzState)) {
    if (gameStartCountdownAt === null) {
      gameStartCountdownAt = Date.now();
    }

    if (isGameStartCountdownExpired()) {
      setGameState(GAME_STATE_GAME);
      return;
    }

    renderGameStartCountdown(canvas, ctx);
  } else {
    renderSoundEffectToSelect(canvas, ctx);
  }

  // Auto-assign sound effect when countdown expires
  if (isCountdownExpired() && currentRenderedSoundEffect && !isInputFrozen()) {
    const playerIndex = findPlayerToAutoAssign(buzzState);
    if (playerIndex !== null) {
      const assigned = getPlayerState(playerIndex).setSoundEffect(currentRenderedSoundEffect.name);
      if (assigned) {
        getPlayerState(playerIndex).setLedState(true);
        playerWithLedOn = playerIndex;
        pendingNextSoundEffect = true;
        freezeInput(FREEZE_DURATION);
      }
    }
  }

  buzzState.forEach((state, index) => {
    const released = getPlayerState(index).hasReleasedBuzz(state.buzz);
    if (released && currentRenderedSoundEffect && !isInputFrozen()) {
      const assigned = getPlayerState(index).setSoundEffect(currentRenderedSoundEffect.name);
      if (assigned) {
        stopSoundEffect(currentRenderedSoundEffect.name);
        assignSound.play();
        getPlayerState(index).setLedState(true);
        playerWithLedOn = index;
        pendingNextSoundEffect = true;
        freezeInput(FREEZE_DURATION);
      }
    }

    // Allow players to play their stored sounds when input is not frozen
    if (!isInputFrozen()) {
      const colorButtons: ButtonName[] = ['blue', 'orange', 'green', 'yellow'];
      colorButtons.forEach((button) => {
        const pressed = getPlayerState(index).hasButtonPressed(button, state[button]);
        if (pressed) {
          const soundName = getPlayerState(index).getSoundEffect(button);
          if (soundName) {
            playSoundEffectByName(soundName);
          }
        }
      });
    }
  });

  buzzState.forEach((state, index) => {
    const xWobble = Math.sin(Date.now() / 1000 + index) * 10;
    const yWobble = Math.cos(Date.now() / 1000 + index) * 10;
    const xPos = xWobble + (90 + index * controllerImageSrcWidth);
    const yPos = yWobble + 200;

    const remaining = getPlayerState(index).getRemainingSlots();
    const assigned = 4 - remaining;

    const playerState = getPlayerState(index);
    const buttonEmojis: ButtonEmojis = {
      blue: getEmojiForSoundEffect(playerState.getSoundEffect('blue') ?? ''),
      orange: getEmojiForSoundEffect(playerState.getSoundEffect('orange') ?? ''),
      green: getEmojiForSoundEffect(playerState.getSoundEffect('green') ?? ''),
      yellow: getEmojiForSoundEffect(playerState.getSoundEffect('yellow') ?? ''),
    };

    drawControllerWithEmojis(xPos, yPos, state, assigned, 4, buttonEmojis, ctx);
  });
};
