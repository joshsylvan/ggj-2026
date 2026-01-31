import speedLinesSrc from './assets/sprites/speedlines.png'
const speedLinesImage = new Image();
speedLinesImage.src = speedLinesSrc;

export const drawSpeedLines = (
    ctx: CanvasRenderingContext2D,
) => {
    ctx.drawImage(speedLinesImage,
        Math.random() * 10,
        Math.random() * 10
    );
}
