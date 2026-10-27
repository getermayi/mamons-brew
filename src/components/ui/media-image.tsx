import Image, { type ImageProps } from "next/image";
import { isSvg } from "@/lib/utils";

/** next/image that skips optimisation for SVG artwork (which is already tiny and crisp). */
export function MediaImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image {...props} alt={props.alt} unoptimized={props.unoptimized ?? isSvg(src)} />;
}
