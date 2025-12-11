import { createPhotoUrl } from "@net/serverInfo";
import { Image, ImageProps } from "antd";
import React, { useEffect, useState } from "react";

type ImageSize = "small" | "medium" | "big" | null;

interface ImageSeverProps extends ImageProps {
  size?: ImageSize;
}

const sizeMap: Record<
  Exclude<ImageSize, null>,
  { width: number; height: number }
> = {
  small: { width: 40, height: 40 },
  medium: { width: 80, height: 80 },
  big: { width: 160, height: 160 },
};

const ImageSever: React.FC<ImageSeverProps> = ({
  src,
  size = null,
  ...props
}) => {
  const [fullSrc, setFullSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      createPhotoUrl(src).then((url) => setFullSrc(url));
    }
  }, [src]);

  if (!fullSrc) return null;

  const dimension = size ? sizeMap[size] : {};

  return <Image {...props} src={fullSrc} {...dimension} />;
};

export default ImageSever;
