import {
  Fallback as AvatarFbk,
  Image as AvatarImg,
  Root as AvatarRoot,
} from "@radix-ui/react-avatar";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

const Avatar = forwardRef<
  ElementRef<typeof AvatarRoot>,
  ComponentPropsWithoutRef<typeof AvatarRoot>
>(({ className, ...props }, ref) => (
  <AvatarRoot
    className={cn(
      "relative flex size-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = forwardRef<
  ElementRef<typeof AvatarImg>,
  ComponentPropsWithoutRef<typeof AvatarImg>
>(({ className, ...props }, ref) => (
  <AvatarImg
    className={cn("aspect-square size-full", className)}
    ref={ref}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = forwardRef<
  ElementRef<typeof AvatarFbk>,
  ComponentPropsWithoutRef<typeof AvatarFbk>
>(({ className, ...props }, ref) => (
  <AvatarFbk
    className={cn(
      "flex size-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    ref={ref}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
