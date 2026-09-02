"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      try {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      } catch {}
    },
    [setOpenProp, open]
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen, setOpenMobile]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full bg-background has-[[data-variant=inset]]:bg-sidebar",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    collapsible?: "offcanvas" | "icon" | "none";
    variant?: "sidebar" | "floating" | "inset";
  }
>(({ className, children, collapsible = "icon", variant = "sidebar", ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <div
          ref={ref}
          data-mobile="true"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-full w-[17rem] flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground transition-transform duration-200 ease-in-out",
            openMobile ? "translate-x-0" : "-translate-x-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <div
      ref={ref}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      className={cn(
        "relative hidden lg:flex h-svh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear shrink-0",
        state === "expanded" ? "w-[17rem]" : "w-[3.5rem]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 p-3 border-b border-sidebar-border/60", className)} {...props} />
  )
);
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2 group-data-[collapsible=icon]/sidebar-wrapper:overflow-hidden",
        className
      )}
      {...props}
    />
  )
);
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 p-3 border-t border-sidebar-border/60 mt-auto", className)} {...props} />
  )
);
SidebarFooter.displayName = "SidebarFooter";

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex w-full min-w-0 flex-col py-1", className)} {...props} />
  )
);
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar();
    if (state === "collapsed") return null;
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-6 shrink-0 items-center px-2 text-[10px] font-semibold text-sidebar-foreground/70 uppercase tracking-wider",
          className
        )}
        {...props}
      />
    );
  }
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full text-xs space-y-0.5", className)} {...props} />
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} {...props} />
  )
);
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("group/menu-item relative list-none", className)} {...props} />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, size = "default", variant = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-active={isActive}
      data-size={size}
      data-variant={variant}
      className={cn(
        "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-md p-2 text-left text-xs font-medium outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        size === "lg" && "h-12 text-sm p-2 gap-3",
        size === "sm" && "h-7 text-xs p-1.5 gap-2",
        variant === "outline" && "border border-sidebar-border bg-background shadow-xs hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background min-w-0 overflow-x-hidden",
        className
      )}
      {...props}
    />
  )
);
SidebarInset.displayName = "SidebarInset";
