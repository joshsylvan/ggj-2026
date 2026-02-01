import { getAllPlayerStates, getPlayerState } from "../player-state";
import { renderBackground } from "../renderBackground";
import { controllerImageSrcWidth, drawController } from "../renderControllers";
import { readySounds } from "../sound-effects";
import { GAME_STATE_GAME, GAME_STATE_SOUND_SELECT, setGameState } from "../state";
import type { BuzzerState } from "../types/buzz";

let numberOfReadyPlayers = 0;
const COOLDOWN_TIME_MS = 4000;
const COOLDOWN_TIME_SECONDS = 4;

let readyTime: undefined | number;

export const update = (deltaTime: number, buzzState: BuzzerState[]) => {
    if (numberOfReadyPlayers < 4) {
        buzzState.forEach((state, index) => {
            const player = getPlayerState(index);
            if (!player.isReady() && state.buzz) {
                player.setIsReady(true);
                console.log('read', numberOfReadyPlayers);
                readySounds[numberOfReadyPlayers].play();
                ++numberOfReadyPlayers
            }
        });
    }

    if (!readyTime && numberOfReadyPlayers === 4) {
        // numberOfReadyPlayers = 0;
        buzzState.forEach((_state, index) => {
            const player = getPlayerState(index);
            getPlayerState(index).setIsReady(false);
        });

        readyTime = Date.now();
    }

    if (readyTime) {
        if (Date.now() - readyTime > COOLDOWN_TIME_MS) {
            console.log('GO NEXT!');
            numberOfReadyPlayers = 0;
            readyTime = undefined;
            setGameState(GAME_STATE_SOUND_SELECT);
        }
    }


}

export const render = (
    buzzState: BuzzerState[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) => {
    renderBackground(canvas, ctx);

    ctx.fontKerning = "auto"
    ctx.letterSpacing = "2px"
    ctx.font = "16px Minecraft";
    ctx.fillStyle = 'white';

    if (readyTime) {
        const secondsLeft = Math.floor(COOLDOWN_TIME_SECONDS - ((Date.now() - readyTime) / 1000));
        ctx.fillText(`Sound select in ${secondsLeft}`, (canvas.width / 2) + Math.sin(Date.now()), (canvas.height / 2) + Math.cos(Date.now()));
    } else {
        ctx.fillStyle = 'white';

        ctx.textAlign = 'center';
        ctx.fillText("Press BUZZ when you hear a sound you want.", (canvas.width / 2), 32);
        ctx.fillText("There is only 1 of each sound.", (canvas.width / 2), 64);
        ctx.fillText("First come first serve", (canvas.width / 2), 96);
        ctx.fillText("You have to have 4 sounds.", (canvas.width / 2), 128);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.fillStyle = 'red';
        ctx.fillText(`BUZZ to ready... ${numberOfReadyPlayers} / 4 ready`, (canvas.width / 2) + Math.sin(Date.now()), 160 + Math.cos(Date.now()));
    }
    buzzState.forEach((state, index) => {
        let xWobble = Math.sin((Date.now() / 1000) + index) * 10;
        let yWobble = Math.cos((Date.now() / 1000) + index) * 10;

        drawController(xWobble + (90 + index * controllerImageSrcWidth), yWobble + 200, state, ctx);
    });
}