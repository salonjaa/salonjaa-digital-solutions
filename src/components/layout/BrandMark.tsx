import Image from "next/image";

// Intrinsic size of public/images/logo-mark.png — used to preserve aspect ratio at any render size.
const NATIVE_WIDTH = 1152;
const NATIVE_HEIGHT = 1365;

export function BrandMark({
  size = 40,
  className,
  priority = false,
}: {
  /** Rendered height in px; width is derived from the logo's aspect ratio. */
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const width = Math.round((size * NATIVE_WIDTH) / NATIVE_HEIGHT);
  return (
    <Image
      src="/images/logo-mark.png"
      alt="Salonjaa Digital Solutions"
      width={width}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
