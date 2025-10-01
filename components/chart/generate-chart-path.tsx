export const generateChartPath = (
  data: number[],
  width: number,
  height: number,
): { linePath: string; areaPath: string } => {
  if (!data.length) return { linePath: "", areaPath: "" };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const stepX = width / (data.length - 1);

  const points = data.map((value, idx) => {
    const x = idx * stepX;
    const y = height - ((value - min) / range) * height;

    return [x, y];
  });

  const linePath = "M" + points.map(([x, y]) => `${x},${y}`).join("L");

  const areaPath = linePath + `L${width},${height}L0,${height}Z`;

  return { linePath, areaPath };
};
