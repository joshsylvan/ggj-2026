import { renderBackground } from "../renderBackground";
import { controllerImageSrcWidth, drawController } from "../renderControllers";
import type { BuzzerState } from "../types/buzz";

export const update = (deltaTime: number) => { }
export const render = (
    deltaTime: number,
    buzzState: BuzzerState[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) => {
    renderBackground(canvas, ctx);


    ctx.fillStyle = 'white';
    ctx.fillText("Press the BUZZ when you hear a sound you want.", 10, 10);


    buzzState.forEach((state, index) => {
        let xWobble = Math.sin((Date.now() / 1000) + index) * 10;
        let yWobble = Math.cos((Date.now() / 1000) + index) * 10;

        drawController(xWobble + (90 + index * controllerImageSrcWidth), yWobble + 200, state, ctx);
    });

}