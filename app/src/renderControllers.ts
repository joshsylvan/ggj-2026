import type { BuzzerState } from "./types/buzz";
import controllerImageSrc from './assets/sprites/controllers.png';

export const controllerImageSrcWidth = 116;
export const controllerImageSrcHeight = 200;
const controllerImage = new Image();
controllerImage.src = controllerImageSrc;


export const drawController = (
    x: number,
    y: number,
    controllerState: BuzzerState,
    ctx: CanvasRenderingContext2D,
) => {
    ctx.drawImage(
        controllerImage,
        0,
        0,
        controllerImageSrcWidth,
        controllerImageSrcHeight,
        Math.floor(x),
        Math.floor(y),
        controllerImageSrcWidth,
        controllerImageSrcHeight
    );
    const valueOrder = ['buzz', 'blue', 'orange', 'green', 'yellow'];
    valueOrder.forEach((buttonName, index) => {
        if (controllerState[buttonName as keyof BuzzerState]) {
            ctx.drawImage(
                controllerImage,
                (index + 1) * controllerImageSrcWidth,
                0,
                controllerImageSrcWidth,
                controllerImageSrcHeight,
                x,
                y,
                controllerImageSrcWidth,
                controllerImageSrcHeight
            );
        }
    });
}
