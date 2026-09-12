import { Button, type ButtonProps } from "./Button";

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

type GradientButtonProps = DistributiveOmit<ButtonProps, "variant">;

/**
 * The signature gradient-border pill CTA (navbar "Book A Free Call", hero
 * "Start Your Project", section CTAs). Thin named wrapper around `Button`'s
 * `primary` variant so every gradient-border button in the app renders
 * identically — restyle in one place (`Button`'s `variantClass.primary`).
 */
export function GradientButton(props: GradientButtonProps) {
  return <Button variant="primary" {...(props as ButtonProps)} />;
}
