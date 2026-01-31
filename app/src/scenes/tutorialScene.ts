import { getAllPlayerStates, getPlayerState } from "../player-state";
import { renderBackground } from "../renderBackground";
import { controllerImageSrcWidth, drawController } from "../renderControllers";
import type { BuzzerState } from "../types/buzz";

let numberOfReadyPlayers = 0;


const readySoundPath = 'sounds/synth-stab.mp3';
const readySound = new Audio(readySoundPath);

export const update = (deltaTime: number, buzzState: BuzzerState[]) => {

    numberOfReadyPlayers = 0;

    buzzState.forEach((state, index) => {
        const player = getPlayerState(index);
        if (!player.isReady() && state.buzz) {
            getPlayerState(index).setIsReady(true);
            readySound.play();
        }
    });

    let isEveryoneReady = true;
    getAllPlayerStates().forEach((playerState) => {
        if (playerState.isReady()) {
            ++numberOfReadyPlayers;
        }
        isEveryoneReady = isEveryoneReady && playerState.isReady();
    });

    if (isEveryoneReady) {
        buzzState.forEach((_state, index) => {
            const player = getPlayerState(index);
            getPlayerState(index).setIsReady(false);
        });
        console.log("READY!");
    }

}

export const render = (
    buzzState: BuzzerState[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) => {
    renderBackground(canvas, ctx);
    ctx.fillStyle = 'white';
    ctx.fontKerning = "auto"
    ctx.letterSpacing = "2px"
    ctx.font = "16px Minecraft";
    ctx.textAlign = 'center';
    ctx.fillText("Press BUZZ when you hear a sound you want.", (canvas.width / 2), 32);
    ctx.fillText("There is only 1 of each sound.", (canvas.width / 2), 64);
    ctx.fillText("First come first serve", (canvas.width / 2), 96);
    ctx.fillText("You have to have 4 sounds.", (canvas.width / 2), 128);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = 'red';
    ctx.fillText(`BUZZ to ready... ${numberOfReadyPlayers} / 4 ready`, (canvas.width / 2) + Math.sin(Date.now()), 160 + Math.cos(Date.now()));

    buzzState.forEach((state, index) => {
        let xWobble = Math.sin((Date.now() / 1000) + index) * 10;
        let yWobble = Math.cos((Date.now() / 1000) + index) * 10;

        drawController(xWobble + (90 + index * controllerImageSrcWidth), yWobble + 200, state, ctx);
    });
}