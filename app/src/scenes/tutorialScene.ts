import { renderBackground } from "../renderBackground";
import { controllerImageSrcWidth, drawController } from "../renderControllers";
import type { BuzzerState } from "../types/buzz";

export const update = (_deltaTime: number) => { }
export const render = (
    deltaTime: number,
    buzzState: BuzzerState[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) => {
    renderBackground(canvas, ctx, deltaTime);

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


    buzzState.forEach((state, index) => {
        let xWobble = Math.sin((Date.now() / 1000) + index) * 10;
        let yWobble = Math.cos((Date.now() / 1000) + index) * 10;

        drawController(xWobble + (90 + index * controllerImageSrcWidth), yWobble + 200, state, ctx);
    });
}