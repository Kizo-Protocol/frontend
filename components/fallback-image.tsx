"use client";
import { useState } from "react";
import Image, { ImageProps } from "next/image";

import { FALLBACK_IMAGE } from "@/lib/constants";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallback?: string;
}

export default function FallbackImage({
  src,
  fallback = FALLBACK_IMAGE,
  alt,
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <Image
      {...props}
      alt={alt}
      draggable={false}
      src={imgSrc}
      onError={() => setImgSrc(fallback)}
    />
  );
}
