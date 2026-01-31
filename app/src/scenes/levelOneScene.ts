import cinemaSrc from '../assets/sprites/cinema.png';
import headSpritesheetSrc from '../assets/sprites/heads-spritesheet.png'
import type { BuzzerState } from "../types/buzz";

const cinemaImg = new Image();
cinemaImg.src = cinemaSrc;
const headsImg = new Image();
headsImg.src = headSpritesheetSrc;

export const firstRowHeight = 139;
export const secondRowHeight = 133;
export const headsWidth = 640

let headsElapsed = 0;
let headsTurned = false;

export const update = (deltaTime: number) => {
  if (!headsTurned) {
    headsElapsed += deltaTime;

    if (headsElapsed >= 0.2) {
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
    ctx.drawImage(
        cinemaImg,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
    );
    // Call this when something gets everyone's attention: 
    // turnHeads(0, 130, canvas, ctx);
}


function turnHeads(
    x: number,
    y: number,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
) {
    ctx.drawImage(
        /* source image */ headsImg,
        /* top x-coord subrectangle */ 0,
        /* top y-coord subrectangle */ headsTurned ? 0 : firstRowHeight,
        /* width of subrectangle */ headsWidth,
        /* height of subrectangle */ headsTurned ? secondRowHeight : firstRowHeight,
        /* x axis placement */ Math.floor(x),
        /* y axis placement */ Math.floor(y),
        /* width of image to draw */ canvas.width,
        /* height of image to draw */ headsTurned ? secondRowHeight : firstRowHeight,
    )
}