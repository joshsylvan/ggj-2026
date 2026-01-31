import cinemaSrc from '../assets/sprites/cinema.png';
import headSpritesheetSrc from '../assets/sprites/heads-spritesheet2.png';
import type { BuzzerState } from '../types/buzz';
import { drawSpeedLines } from '../renderSpeedLines';
import {
    controllerImageSrcWidth,
    drawControllerWithEmojis,
    type ButtonEmojis,
} from '../renderControllers';
import { getEmojiForSoundEffect, playSoundEffectByName } from '../sound-effects';
import { getAllPlayerStates, getPlayerState, resetAllLedStates } from '../player-state';
import { registerSceneInit, GAME_STATE_GAME, type ButtonName } from '../state';

import caughtSoundSrc from '../../public/sounds/shocked-sound-effect.mp3'

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

let headsElapsed = 0;
let headsTurned = false;
const playerSoundCooldowns: Map<number, number> = new Map();
const SOUND_COOLDOWN_MS = 500; // Half second cooldown between sounds

let shouldTurnHeads = false;
let turnHeadsStartTime = 0;

const canPlayerPlaySound = (playerIndex: number): boolean => {
    const lastPlayed = playerSoundCooldowns.get(playerIndex) ?? 0;
    return Date.now() - lastPlayed >= SOUND_COOLDOWN_MS;
};

const markPlayerPlayedSound = (playerIndex: number): void => {
    playerSoundCooldowns.set(playerIndex, Date.now());
};

let startTime!: number;
let eventIndex = 0;
let currentEvents: TimelineEvent[] = [];
const events: TimelineEvent[] = [
    {
        startTime: 0,
        duration: 500,
        noiseLevel: 1,
    },
    {
        startTime: 1000,
        duration: 500,
        noiseLevel: 2,
    },
    {
        startTime: 2000,
        duration: 3000,
        noiseLevel: 1,
    },
    {
        startTime: 3000,
        duration: 1000,
        noiseLevel: 2,
    },
    {
        startTime: 10000,
        duration: 1000,
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
}

export const init = () => {
    console.log('init')
    headsElapsed = 0;
    headsTurned = false;
    resetAllLedStates();
    startTime = Date.now();
    eventIndex = 0;
    currentEvents = [];
};

// Register init to be called when scene starts
registerSceneInit(GAME_STATE_GAME, init);

interface PlayerSoundState {
    isPlaying: boolean;
    startTime: number;
}
const createEmptySoundState = (): PlayerSoundState => ({ isPlaying: false, startTime: 0 });
const playerSoundInput: PlayerSoundState[] = [createEmptySoundState(), createEmptySoundState(), createEmptySoundState(), createEmptySoundState()];


export const update = (deltaTime: number, buzzState: BuzzerState[]) => {
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
                    playerSoundInput[index].isPlaying = true;
                    playerSoundInput[index].startTime = Date.now();
                    // 
                    const soundName = getPlayerState(index).getSoundEffect(buttonName) as string;
                    if (soundName) {
                        playSoundEffectByName(soundName);
                        if (getCurrentEventNoiseLevel() <= 0) {
                            shouldTurnHeads = true;
                            turnHeadsStartTime = Date.now();
                            caughtAudio.volume = 0.5;
                            caughtAudio.play();
                        }
                        getPlayerState(index).removeSoundEffect(buttonName);
                    }
                    break;
                }
            }
        }
    });
    playerSoundInput.forEach(soundInput => {
        if (soundInput.isPlaying && Date.now() - soundInput.startTime >= 1500) {
            soundInput.isPlaying = false;
        }
    });

    if (!headsTurned) {
        headsElapsed += deltaTime;
        if (headsElapsed >= 0.5) {
            headsTurned = true;
        }
    }
};

export const render = (
    deltaTime: number,
    buzzState: BuzzerState[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) => {
    ctx.drawImage(cinemaImg, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    buzzState.forEach((state, index) => {
        const playerState = getPlayerState(index);

        const xWobble = Math.sin(Date.now() / 1000 + index) * 10;
        const yWobble = Math.cos(Date.now() / 1000 + index) * 10;
        const xPos = xWobble + (90 + index * controllerImageSrcWidth);
        const yPos = yWobble + 200;

        const remaining = getPlayerState(index).getRemainingSlots();
        // const assigned = 4 - remaining;
        const buttonEmojis: ButtonEmojis = {
            blue: getEmojiForSoundEffect(playerState.getSoundEffect('blue') ?? ''),
            orange: getEmojiForSoundEffect(playerState.getSoundEffect('orange') ?? ''),
            green: getEmojiForSoundEffect(playerState.getSoundEffect('green') ?? ''),
            yellow: getEmojiForSoundEffect(playerState.getSoundEffect('yellow') ?? ''),
        };

        drawControllerWithEmojis(xPos, yPos, state, 4, 0, buttonEmojis, ctx, 0.5);
    });
    ctx.fillStyle = 'white';
    ctx.font = '24px Minecraft'
    ctx.fillText(`TIME: ${Date.now() - startTime}  | Events ${currentEvents.length}`, 100, 100);
    // Call this when something gets everyone's attention:
    if (shouldTurnHeads) {
        turnHeads(0, 130, canvas, ctx);
        if (Date.now() - turnHeadsStartTime >= 1000) {
            shouldTurnHeads = false;
        }
    }
};

function turnHeads(x: number, y: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = 0.4;
    if (headsTurned) drawSpeedLines(ctx);
    ctx.globalAlpha = 1;
    ctx.drawImage(
    /* source image */ headsImg,
    /* top x-coord subrectangle */ 0,
    /* top y-coord subrectangle */ headsTurned ? 0 : firstRowHeight,
    /* width of subrectangle */ headsWidth,
    /* height of subrectangle */ headsTurned ? secondRowHeight : firstRowHeight,
    /* x axis placement */ Math.floor(x) + (headsTurned ? Math.random() * 10 : 0),
    /* y axis placement */ Math.floor(y) + (headsTurned ? Math.random() * 10 : 0),
    /* width of image to draw */ canvas.width,
    /* height of image to draw */ headsTurned ? secondRowHeight : firstRowHeight
    );
}
