import cinemaSrc from '../assets/sprites/cinema.png';
import headSpritesheetSrc from '../assets/sprites/heads-spritesheet2.png';
import type { BuzzerState } from '../types/buzz';
import { drawSpeedLines } from '../renderSpeedLines';
import {
  controllerImageSrcWidth,
  drawControllerWithEmojis,
  type ButtonEmojis,
} from '../renderControllers';
import {
  getEmojiForSoundEffect,
  getSoundEffectDuration,
  playSoundEffectByName,
} from '../sound-effects';
import { getAllPlayerStates, getPlayerState, resetAllLedStates } from '../player-state';
import {
  registerSceneInit,
  GAME_STATE_GAME,
  type ButtonName,
  setGameState,
  GAME_STATE_RESULTS,
} from '../state';

import caughtSoundSrc from '/sounds/shocked-sound-effect.mp3';
import { getMovieDuration, playMovie } from '../moviePlayback';

const cinemaImg = new Image();
cinemaImg.src = cinemaSrc;
const headsImg = new Image();
headsImg.src = headSpritesheetSrc;

const caughtAudio = new Audio(caughtSoundSrc);

interface TimelineEvent {
  startTime: number;
  duration: number;
  noiseLevel: number;
}

export const firstRowHeight = 139;
export const secondRowHeight = 133;
export const headsWidth = 640;
export const buttons: ButtonName[] = ['blue', 'orange', 'green', 'yellow'];

// let headsElapsed = 0;
// let headsTurned = false;
const playerSoundCooldowns: Map<number, number> = new Map();
const SOUND_COOLDOWN_MS = 500; // Half second cooldown between sounds

let turnHeadsStartTime = 0;
let turnHeadsEndTime = 0;

const canPlayerPlaySound = (playerIndex: number): boolean => {
  const lastPlayed = playerSoundCooldowns.get(playerIndex) ?? 0;
  return Date.now() - lastPlayed >= SOUND_COOLDOWN_MS;
};

const markPlayerPlayedSound = (playerIndex: number): void => {
  playerSoundCooldowns.set(playerIndex, Date.now());
};

let startTime: number = 0;
let movieEndTime: number = 0;
let eventIndex = 0;
let currentEvents: TimelineEvent[] = [];
const events: TimelineEvent[] = [
  {
    startTime: 500, // Movie intro sound
    duration: 500,
    noiseLevel: 1,
  },
  {
    startTime: 25000, // Shaver
    duration: 2000,
    noiseLevel: 2,
  },
  {
    startTime: 40000, // Interval sounds
    duration: 16000,
    noiseLevel: 3,
  },
  {
    startTime: 66000, // Western 1
    duration: 4000,
    noiseLevel: 2,
  },
  {
    startTime: 60000 + 11000, // Western 2
    duration: 1000,
    noiseLevel: 3,
  },
  {
    startTime: 60000 + 11000, // Western 2
    duration: 1000,
    noiseLevel: 3,
  },
  {
    startTime: 60000 + 11100, // Phone
    duration: 3000,
    noiseLevel: 3,
  },
  {
    startTime: 60000 + 17000, // GUN
    duration: 500,
    noiseLevel: 3,
  },
  {
    startTime: 60000 + 46000, // Outro
    duration: 10000,
    noiseLevel: 3,
  },
];

const hasEventStarted = (event: TimelineEvent): boolean => {
  return Date.now() - startTime >= event.startTime;
};
const hasEventFinished = (event: TimelineEvent): boolean => {
  return Date.now() - startTime >= event.startTime + event.duration;
};
const getCurrentEventNoiseLevel = (): number => {
  let noiseLevel = 0;
  currentEvents.forEach((event) => {
    noiseLevel = Math.max(event.noiseLevel, noiseLevel);
  });
  return noiseLevel;
};

export const init = () => {
  console.log('init');
  // headsElapsed = 0;
  // headsTurned = false;
  resetAllLedStates();

  playMovie(() => {
    startTime = Date.now() + 1000; // Here because hacky
    movieEndTime = startTime + getMovieDuration();
    eventIndex = 0;
    currentEvents = [];
  });
};

// Register init to be called when scene starts
registerSceneInit(GAME_STATE_GAME, init);

interface PlayerSoundState {
  isPlaying: boolean;
  startTime: number;
}
const createEmptySoundState = (): PlayerSoundState => ({ isPlaying: false, startTime: 0 });
const playerSoundInput: PlayerSoundState[] = [
  createEmptySoundState(),
  createEmptySoundState(),
  createEmptySoundState(),
  createEmptySoundState(),
];

export const update = (deltaTime: number, buzzState: BuzzerState[]) => {
  if (startTime === 0) return;
  // Check for new events
  for (let i = eventIndex; eventIndex < events.length; ++i) {
    if (hasEventStarted(events[eventIndex])) {
      currentEvents.push(events[eventIndex]);
      ++eventIndex;
    } else {
      break;
    }
  }

  // Filter out any events no longer happening
  currentEvents = currentEvents.filter((event) => !hasEventFinished(event));

  buzzState.forEach((state, index) => {
    if (!playerSoundInput[index].isPlaying) {
      for (let i = 0; i < buttons.length; ++i) {
        const buttonName = buttons[i];
        if (state[buttonName as keyof BuzzerState]) {
          const soundName = getPlayerState(index).getSoundEffect(buttonName) as string;
          if (soundName) {
            playerSoundInput[index].isPlaying = true;
            playerSoundInput[index].startTime = Date.now();
            playSoundEffectByName(soundName);
            if (getCurrentEventNoiseLevel() <= 0) {
              // Only change the start time if nothing is playing
              if (turnHeadsStartTime === 0) {
                turnHeadsStartTime = Date.now();
              }
              // Make sure the sound effect as a minimum duration of one second
              const nextEndTIme = Date.now() + Math.max(getSoundEffectDuration(soundName), 1000);
              // Only  update the end time if the new sound effect finishes after the current
              if (nextEndTIme > turnHeadsEndTime) {
                turnHeadsEndTime = nextEndTIme;
              }
              getPlayerState(index).addSoundEffectToScore(soundName, -1);
              caughtAudio.volume = 0.5;
              caughtAudio.play();
            } else {
              getPlayerState(index).addSoundEffectToScore(soundName);
            }
            getPlayerState(index).removeSoundEffect(buttonName);
            break;
          }
        }
      }
    }
  });

  playerSoundInput.forEach((soundInput) => {
    if (soundInput.isPlaying && Date.now() - soundInput.startTime >= 1500) {
      soundInput.isPlaying = false;
    }
  });
  // Check if the movie has finished with a 1 second buffer
  if (Boolean(startTime) && Date.now() >= movieEndTime + 1000) {
    setGameState(GAME_STATE_RESULTS);
  }

  playerSoundInput.forEach((soundInput) => {
    if (soundInput.isPlaying && Date.now() - soundInput.startTime >= 1500) {
      soundInput.isPlaying = false;
    }
  });
  // Check if the movie has finished with a 1 second buffer
  if (Date.now() >= movieEndTime + 1000) {
    setGameState(GAME_STATE_RESULTS);
  }
};

export const render = (
  deltaTime: number,
  buzzState: BuzzerState[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  ctx.drawImage(cinemaImg, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

  // Draw fullTurn behind controllers
  if (turnHeadsStartTime) {
    fullTurn(canvas, ctx);
    if (Date.now() >= turnHeadsEndTime) {
      turnHeadsStartTime = 0;
      turnHeadsEndTime = 0;
    }
  }

  buzzState.forEach((state, index) => {
    const playerState = getPlayerState(index);

    const xWobble = Math.sin(Date.now() / 1000 + index) * 10;
    const yWobble = Math.cos(Date.now() / 1000 + index) * 10;
    const xPos = xWobble + (90 + index * controllerImageSrcWidth);
    const yPos = yWobble + 200;

    // ctx.fillStyle = 'white';
    // ctx.font = '24px Minecraft';
    // ctx.fillText(`TIME: ${Date.now() - startTime}  | Events ${currentEvents.length}`, 100, 100);

    const buttonEmojis: ButtonEmojis = {
      blue: getEmojiForSoundEffect(playerState.getSoundEffect('blue') ?? ''),
      orange: getEmojiForSoundEffect(playerState.getSoundEffect('orange') ?? ''),
      green: getEmojiForSoundEffect(playerState.getSoundEffect('green') ?? ''),
      yellow: getEmojiForSoundEffect(playerState.getSoundEffect('yellow') ?? ''),
    };
    // Hardcoded 4 to remove the ready text
    drawControllerWithEmojis(
      xPos,
      yPos,
      state,
      4,
      0,
      buttonEmojis,
      ctx,
      0.5,
      playerState.getScore(),
      true
    );
  });
};

function partialTurn(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  let srcY = secondRowHeight;
  let height = secondRowHeight;
  ctx.globalAlpha = 0.4;
  let x = 0,
    y = 130;
  ctx.globalAlpha = 1;
  ctx.drawImage(
    /* source image */ headsImg,
    /* top x-coord subrectangle */ 0,
    /* top y-coord subrectangle */ srcY,
    /* width of subrectangle */ headsWidth,
    /* height of subrectangle */ height,
    /* x axis placement */ Math.floor(x),
    /* y axis placement */ Math.floor(y),
    /* width of image to draw */ canvas.width,
    /* height of image to draw */ height
  );
}

function fullTurn(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const duration = Date.now() - turnHeadsStartTime;
  let srcY = secondRowHeight;
  let height = secondRowHeight;
  ctx.globalAlpha = 0.4;
  let x = 0,
    y = 130;

  if (duration >= 500) {
    drawSpeedLines(ctx);
    srcY = 0;
    height = firstRowHeight;
    x += Math.random() * 10;
    y += Math.random() * 10;
  }
  ctx.globalAlpha = 1;
  ctx.drawImage(
    /* source image */ headsImg,
    /* top x-coord subrectangle */ 0,
    /* top y-coord subrectangle */ srcY,
    /* width of subrectangle */ headsWidth,
    /* height of subrectangle */ height,
    /* x axis placement */ Math.floor(x),
    /* y axis placement */ Math.floor(y),
    /* width of image to draw */ canvas.width,
    /* height of image to draw */ height
  );
}
