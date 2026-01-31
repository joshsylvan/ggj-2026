export const renderBackground = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  gradientColors: string[] = ['#ee8695', '#fbbbad']
) => {
  const scale = 100;
  const gradient = ctx.createLinearGradient(
    ((Math.sin(Date.now() / 1000) + 1) / 4) * (canvas.width / scale),
    0,
    canvas.width / scale,
    canvas.height / scale
  );
  gradientColors.forEach((color, index) => {
    gradient.addColorStop(index / (gradientColors.length - 1), color);
  });
  ctx.fillStyle = gradient;

  ctx.scale(scale, scale);
  ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

  floydSteinbergBlocky(ctx, canvas.width, canvas.height, {
    step: 20,
    blockSize: 2,
    maxError: 6,
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

function floydSteinbergBlocky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  { step = 16, blockSize = 2, maxError = 10 } = {}
) {
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;

  const idx = (x: number, y: number) => (y * width + x) * 4;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));

  for (let y = 0; y < height; y += blockSize) {
    const leftToRight = (y / blockSize) % 2 === 0;

    let xStart = leftToRight ? 0 : width - blockSize;
    let xEnd = leftToRight ? width : -blockSize;
    let xStep = leftToRight ? blockSize : -blockSize;

    for (let x = xStart; x !== xEnd; x += xStep) {
      // average block color
      let avg = [0, 0, 0];
      let count = 0;

      for (let by = 0; by < blockSize; by++) {
        for (let bx = 0; bx < blockSize; bx++) {
          const px = x + bx;
          const py = y + by;
          if (px >= width || py >= height) continue;
          const i = idx(px, py);
          avg[0] += data[i];
          avg[1] += data[i + 1];
          avg[2] += data[i + 2];
          count++;
        }
      }

      for (let c = 0; c < 3; c++) {
        avg[c] /= count;
      }

      // quantize block
      let err = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const q = Math.round(avg[c] / step) * step;
        err[c] = Math.max(-maxError, Math.min(maxError, avg[c] - q));

        // write quantized color to block
        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            const px = x + bx;
            const py = y + by;
            if (px >= width || py >= height) continue;
            const i = idx(px, py);
            data[i + c] = clamp(q);
          }
        }
      }

      // diffuse error to neighboring blocks
      const spread = (dx: number, dy: number, weight: number) => {
        const nx = x + dx * blockSize;
        const ny = y + dy * blockSize;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;

        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            const px = nx + bx;
            const py = ny + by;
            if (px >= width || py >= height) continue;
            const i = idx(px, py);
            for (let c = 0; c < 3; c++) {
              data[i + c] = clamp(data[i + c] + err[c] * weight);
            }
          }
        }
      };

      if (leftToRight) {
        spread(1, 0, 7 / 16);
        spread(-1, 1, 3 / 16);
        spread(0, 1, 5 / 16);
        spread(1, 1, 1 / 16);
      } else {
        spread(-1, 0, 7 / 16);
        spread(1, 1, 3 / 16);
        spread(0, 1, 5 / 16);
        spread(-1, 1, 1 / 16);
      }
    }
  }

  ctx.putImageData(img, 0, 0);
}
