"use client";

import {
  Content as TabsContentPrimitive,
  List as TabsListPrimitive,
  Root as TabsRoot,
  Trigger as TabsTriggerPrimitive,
} from "@radix-ui/react-tabs";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsRoot;

const TabsList = forwardRef(
  (
    { className, ...props }: ComponentPropsWithoutRef<typeof TabsListPrimitive>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <TabsListPrimitive
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted/50 p-1 text-muted-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

const TabsTrigger = forwardRef(
  (
    {
      className,
      ...props
    }: ComponentPropsWithoutRef<typeof TabsTriggerPrimitive>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <TabsTriggerPrimitive
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef(
  (
    {
      className,
      ...props
    }: ComponentPropsWithoutRef<typeof TabsContentPrimitive>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <TabsContentPrimitive
        className={cn("mt-6 focus-visible:outline-none", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
