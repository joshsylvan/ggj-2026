import { getPlayerState } from "../player-state";
import { renderBackground } from "../renderBackground"
import { controllerImageSrcWidth, drawController, drawControllerWithEmojis } from "../renderControllers";
import { readySounds } from "../sound-effects";
import type { BuzzerState } from "../types/buzz"


const crownSprite = new Image();
crownSprite.src = '/crown.png';

let winnerPlayerIndex = 0;
let numberOfReadyPlayers = 0;

export const update = (deltaTime: number, buzzState: BuzzerState[]): void => {

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

    if (numberOfReadyPlayers === 4) {
        buzzState.forEach((_state, index) => {
            const player = getPlayerState(index);
            getPlayerState(index).setIsReady(false);
        });
        window.location.reload();
    }
}

export const render = (deltaTime: number, buzzState: BuzzerState[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void => {

    renderBackground(canvas, ctx);

    ctx.font = '32px Minecraft';
    ctx.fillStyle = 'white';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center'
    ctx.fillText(`player ${winnerPlayerIndex + 1} was subtle`, canvas.width / 2, 64);

    ctx.fillStyle = 'green';
    ctx.textAlign = 'center';
    ctx.fillText(`BUZZ to play again ${numberOfReadyPlayers} / 4`, (canvas.width / 2), 120 + Math.cos(Date.now() / 1000) * 10);

    buzzState.forEach((state, index) => {
        let xWobble = Math.sin((Date.now() / 1000) + index) * 10;
        let yWobble = Math.cos((Date.now() / 1000) + index) * 10;

        const x = xWobble + (90 + index * controllerImageSrcWidth);
        const y = yWobble + 200;
        if (winnerPlayerIndex === index) {

            ctx.drawImage(crownSprite, x + 25, y - 60, 64, 64)
        }
        drawController(x, y, state, ctx);
    });

}