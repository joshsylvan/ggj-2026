export const renderBackground = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const scale = 100;
    const gradient = ctx.createLinearGradient(
        ((Math.sin((Date.now() / 1000)) + 1) / 2) * (canvas.width / scale),
        0,
        canvas.width / scale,
        canvas.height / scale
    );
    gradient.addColorStop(0, '#ee8695');
    gradient.addColorStop(1, '#fbbbad');
    ctx.fillStyle = gradient;

    ctx.scale(scale, scale);
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
    ctx.setTransform(1, 0, 0, 1, 0, 0)
};