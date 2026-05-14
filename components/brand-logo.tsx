import Image from "next/image";
import { site } from "@/lib/site-config";

export function BrandLogo({
  size = "md",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const boxClass = {
    sm: showText ? "h-12 w-40" : "h-8 w-8",
    md: showText ? "h-14 w-48" : "h-9 w-9",
    lg: showText ? "h-16 w-56" : "h-12 w-12",
  }[size];

  const src = showText ? site.logoWide : site.logoIcon;

  return (
    <span className={`relative inline-flex shrink-0 ${boxClass}`} aria-label={site.fullName}>
      <Image
        src={src}
        alt={`${site.fullName} logo`}
        fill
        sizes={showText ? "224px" : "48px"}
        className="object-contain object-left"
        priority={size !== "sm"}
      />
    </span>
  );
}
