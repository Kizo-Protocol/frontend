import React from "react";

function stringToNumber(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  return Math.abs(hash);
}

function numberToColor(num: number, s = 70, l = 55) {
  const h = num % 360;

  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateAvatar(username: string) {
  const baseNum = stringToNumber(username);

  const colors = Array.from({ length: 4 }, (_, i) =>
    numberToColor(baseNum + i * 50),
  );

  const positions = ["66% 77%", "29% 97%", "99% 86%", "29% 88%"];

  const gradients = colors
    .map(
      (c, i) =>
        `radial-gradient(at ${positions[i]}, ${c} 0px, transparent 50%)`,
    )
    .join(", ");

  return {
    backgroundColor: colors[0],
    backgroundImage: gradients,
  };
}

export default function GenerateAvatar({ username }: { username: string }) {
  const style = generateAvatar(username);

  return (
    <div
      className="rounded-full w-full h-full"
      style={{
        ...style,
      }}
    />
  );
}
