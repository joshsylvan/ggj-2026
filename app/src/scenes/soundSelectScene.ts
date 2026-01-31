import { getPlayerState, updateLedState } from '../player-state';
import { renderBackground } from '../renderBackground';
import { controllerImageSrcWidth, drawController } from '../renderControllers';
import type { BuzzerState } from '../types/buzz';

export const update = (deltaTime: number) => {};
export const render = async (
  deltaTime: number,
  buzzState: BuzzerState[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  renderBackground(canvas, ctx);

  buzzState.forEach((state, index) => {
    getPlayerState(index).hasBuzzed(state.buzz);
  });

  buzzState.forEach((state, index) => {
    let xWobble = Math.sin(Date.now() / 1000 + index) * 10;
    let yWobble = Math.cos(Date.now() / 1000 + index) * 10;

    drawController(xWobble + (90 + index * controllerImageSrcWidth), yWobble + 200, state, ctx);
  });
};
