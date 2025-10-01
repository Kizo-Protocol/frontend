export const encodeSvgDataUri = (svgString: string) => {
  if (!svgString.startsWith("data:image/svg+xml,")) {
    return svgString;
  }

  const svgContent = svgString.replace("data:image/svg+xml,", "");
  const encodedSvg = encodeURIComponent(svgContent);

  return `data:image/svg+xml,${encodedSvg}`;
};
