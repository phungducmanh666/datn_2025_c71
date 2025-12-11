import { createPhotoUrl } from "@net/serverInfo";
import { Avatar, AvatarProps } from "antd";
import React, { useEffect, useState } from "react";

type ImageSize = "small" | "medium" | "big" | null;

interface AvatarServerProps extends AvatarProps { }

const AvatarServer: React.FC<AvatarServerProps> = ({ src, ...props }) => {
  const [fullSrc, setFullSrc] = useState<string | null>(null);

  useEffect(() => {
    if (typeof src === "string") {
      if (src.startsWith("http")) {
        setFullSrc(src);
        return;
      }
      createPhotoUrl(src).then((url) => setFullSrc(url));
    }
  }, [src]);

  if (!fullSrc) return null;

  return <Avatar {...props} src={fullSrc} />;
};

export default AvatarServer;
