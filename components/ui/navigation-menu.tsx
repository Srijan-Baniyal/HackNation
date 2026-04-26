"use client";

import { CaretDown } from "@phosphor-icons/react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        "relative z-10 flex max-w-max flex-1 items-center",
        className
      )}
      data-slot="navigation-menu"
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      className={cn(
        "group flex flex-1 list-none items-center gap-1",
        className
      )}
      data-slot="navigation-menu-list"
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      className={cn("relative", className)}
      data-slot="navigation-menu-item"
      {...props}
    />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(
        "group inline-flex h-8 items-center justify-center gap-1 border border-transparent bg-transparent px-2.5 font-medium text-xs transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-open:bg-muted",
        className
      )}
      data-slot="navigation-menu-trigger"
      {...props}
    >
      {children}
      <CaretDown
        aria-hidden="true"
        className="relative top-px size-3 transition duration-200 group-data-open:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "top-0 left-0 w-full border border-border bg-popover p-2 text-popover-foreground shadow-md md:absolute md:w-auto",
        className
      )}
      data-slot="navigation-menu-content"
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "inline-flex h-8 items-center justify-center border border-transparent px-2.5 font-medium text-xs transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
        className
      )}
      data-slot="navigation-menu-link"
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        className={cn(
          "data-closed:zoom-out-95 data-open:zoom-in-90 origin-top overflow-hidden data-closed:animate-out data-open:animate-in md:h-(--radix-navigation-menu-viewport-height) md:w-(--radix-navigation-menu-viewport-width)",
          className
        )}
        data-slot="navigation-menu-viewport"
        {...props}
      />
    </div>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
};
