import { getAllPlayerStates, getPlayerState, updateLedState } from '../player-state';
import { renderBackground } from '../renderBackground';
import {
  controllerImageSrcWidth,
  drawControllerWithEmojis,
  type ButtonEmojis,
} from '../renderControllers';
import { getEmojiForSoundEffect, readySounds } from '../sound-effects';
import { GAME_STATE_RESULTS, registerSceneInit } from '../state';
import type { BuzzerState } from '../types/buzz';
import crownSpriteSrc from '../assets/sprites/crown.png'

const crownSprite = new Image();
crownSprite.src = crownSpriteSrc;

let winnerPlayerIndex = 0;
let winnerPlayerScore = 0;
let numberOfReadyPlayers = 0;
let lightSequenceIndex = 0;
let lastLightChangeTime = 0;
const LIGHT_SEQUENCE_INTERVAL = 150; // ms between light changes

const lightSequencePatterns = [
  [true, false, false, false],
  [false, true, false, false],
  [false, false, true, false],
  [false, false, false, true],
  [false, false, true, false],
  [false, true, false, false],
  [true, false, false, false],
  [true, true, false, false],
  [false, true, true, false],
  [false, false, true, true],
  [false, false, true, true],
  [false, true, true, false],
  [true, true, false, false],
  [true, true, true, true],
  [false, false, false, false],
  [true, true, true, true],
  [false, false, false, false],
  [true, true, true, true],
];

const updateLightSequence = () => {
  const now = Date.now();
  if (now - lastLightChangeTime >= LIGHT_SEQUENCE_INTERVAL) {
    lastLightChangeTime = now;
    lightSequenceIndex = (lightSequenceIndex + 1) % lightSequencePatterns.length;

    const pattern = lightSequencePatterns[lightSequenceIndex];
    for (let i = 0; i < 4; i++) {
      const player = getPlayerState(i);
      player.setForceLedOff(false);
      player.setLedState(pattern[i]);
    }
    updateLedState();
  }
};

export const init = () => {
  console.log('init');

  const playerStates = getAllPlayerStates();

  winnerPlayerIndex = Array.from(playerStates.entries()).reduce((maxIndex, [index, state]) => {
    if (state.getScore(true) > (playerStates.get(maxIndex)?.getScore(true) ?? 0)) {
      return index;
    } else {
      return maxIndex;
    }
  }, 0);

  winnerPlayerScore = playerStates.get(winnerPlayerIndex)?.getScore(true) ?? 0;

  // Reset light sequence
  lightSequenceIndex = 0;
  lastLightChangeTime = Date.now();
};

// Register init to be called when scene starts
registerSceneInit(GAME_STATE_RESULTS, init);

export const update = (deltaTime: number, buzzState: BuzzerState[]): void => {
  // Update light sequence animation
  updateLightSequence();

  if (numberOfReadyPlayers < 4) {
    buzzState.forEach((state, index) => {
      const player = getPlayerState(index);
      if (!player.isReady() && state.buzz) {
        player.setIsReady(true);
        console.log('read', numberOfReadyPlayers);
        readySounds[numberOfReadyPlayers].play();
        ++numberOfReadyPlayers;
      }
    });
  }

  if (numberOfReadyPlayers === 4) {
    buzzState.forEach((_state, index) => {
      const player = getPlayerState(index);
      getPlayerState(index).setIsReady(false);
    });
    window.location.reload();
  }
};

export const render = (
  deltaTime: number,
  buzzState: BuzzerState[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void => {
  renderBackground(canvas, ctx);

  ctx.font = '32px Minecraft';
  ctx.fillStyle = 'white';
  ctx.letterSpacing = '2px';
  ctx.textAlign = 'center';
  ctx.fillText(
    `player ${winnerPlayerIndex + 1} was subtle: ${winnerPlayerScore}`,
    canvas.width / 2,
    64
  );

  ctx.fillStyle = 'green';
  ctx.textAlign = 'center';
  ctx.fillText(
    `BUZZ to play again ${numberOfReadyPlayers} / 4`,
    canvas.width / 2,
    120 + Math.cos(Date.now() / 1000) * 10
  );

  buzzState.forEach((state, index) => {
    let xWobble = Math.sin(Date.now() / 1000 + index) * 10;
    let yWobble = Math.cos(Date.now() / 1000 + index) * 10;

    const x = xWobble + (90 + index * controllerImageSrcWidth);
    const y = yWobble + 200;
    if (winnerPlayerIndex === index) {
      ctx.drawImage(crownSprite, x + 25, y - 60, 64, 64);
    }
    const playerState = getPlayerState(index);

    const buttonEmojis: ButtonEmojis = {
      blue: getEmojiForSoundEffect(playerState.getSoundEffect('blue') ?? ''),
      orange: getEmojiForSoundEffect(playerState.getSoundEffect('orange') ?? ''),
      green: getEmojiForSoundEffect(playerState.getSoundEffect('green') ?? ''),
      yellow: getEmojiForSoundEffect(playerState.getSoundEffect('yellow') ?? ''),
    };

    const playerScore = playerState.getScore(true);
    drawControllerWithEmojis(x, y, state, 4, 0, buttonEmojis, ctx, 1.0, playerScore, true, true);
  });
};
