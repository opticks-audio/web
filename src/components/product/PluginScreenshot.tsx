import Image from "next/image";

type PluginScreenshotProps = {
  src: string;
  alt: string;
  accentFrom: string;
  accentTo: string;
  width: number;
  height: number;
  priority?: boolean;
};

/**
 * Hero-style frame for a plug-in UI screenshot.
 *
 * Renders the PNG inside a subtly-glowing container that matches the
 * plug-in's spectrum accent colours. The glow is a soft, off-axis blur
 * that gives the screenshot the same physical depth our plug-in panels
 * have — it stops the image feeling flat against the dark page.
 */
export function PluginScreenshot({
  src,
  alt,
  accentFrom,
  accentTo,
  width,
  height,
  priority = false,
}: PluginScreenshotProps) {
  return (
    <div className="relative">
      {/* Spectrum-tinted glow halo (subtle) */}
      <div
        className="absolute inset-0 blur-3xl opacity-30 -z-10"
        style={{
          background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
        }}
        aria-hidden
      />

      {/* Glass frame */}
      <div className="relative rounded-2xl border border-border bg-background-elevated/60 backdrop-blur-md p-2 shadow-2xl">
        <div className="overflow-hidden rounded-xl">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className="w-full h-auto block"
          />
        </div>

        {/* Spectrum-gradient hairline at the very bottom edge */}
        <div
          className="mt-2 h-px rounded-full opacity-60"
          style={{
            background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
