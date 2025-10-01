import React from "react";

interface AvatarProps {
  address: string;
  size?: string;
}

export default function GeneratedAvatar({
  address,
  size = "48px",
}: AvatarProps) {
  const localColors = [
    "rgb(73, 213, 11)",
    "rgb(100, 219, 48)",
    "rgb(128, 226, 84)",
    "rgb(155, 232, 121)",
    "rgb(182, 238, 157)",
  ];

  const mixedColors = localColors.map((c) => mixColor(c, "#ffffff", 0.2));

  const radialCircle = "88% 88% at 65% 40%";

  const gradient = `radial-gradient(${radialCircle}, 
    #ffffff 0.52%,
    ${mixedColors[4]} 31.25%, 
    ${mixedColors[2]} 51.56%,
    ${mixedColors[1]} 65.63%, 
    ${mixedColors[0]} 82.29%,
    ${mixedColors[3]} 100%
  )`;

  return (
    <div
      className="rounded-full bg-transparent"
      style={{
        width: size,
        height: size,
        backgroundImage: gradient,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "inline-block",
      }}
      title={address}
    />
  );
}

function mixColor(
  base: string,
  mix: string = "#ffffff",
  mixStrength: number = 0.2,
): string {
  const parseRGB = (color: string): [number, number, number] => {
    const m = color.match(/\d+/g);

    if (!m || m.length < 3) return [255, 255, 255];

    return [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])];
  };

  const toRGB = (r: number, g: number, b: number) =>
    `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  const [r1, g1, b1] = parseRGB(base);
  const [r2, g2, b2] = parseRGB(mix);

  const p = mixStrength;
  const mixChannel = (c1: number, c2: number) => c1 * (1 - p) + c2 * p;

  return toRGB(mixChannel(r1, r2), mixChannel(g1, g2), mixChannel(b1, b2));
}
