import type { ImgHTMLAttributes } from "react";
import { cn } from "@vc-wms/ui";

export const AIAVRO_PRODUCT_NAME = "AIavro";
export const DEFAULT_TENANT_WORKSPACE = "VC Organics Workspace";

export function AiavroWordmark({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      alt="AIavro"
      className={cn("h-7 w-auto object-contain", className)}
      src="/brand/aiavro-wordmark.png"
      {...props}
    />
  );
}

export function AiavroMark({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      alt="AIavro"
      className={cn("h-9 w-9 rounded-panel object-cover", className)}
      src="/brand/aiavro-favicon.png"
      {...props}
    />
  );
}
