
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { ALL_NAV_ITEMS } from "@/lib/constants"
import type { NavItem } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarMenuSub, // Not used in this simplified version
  // SidebarMenuSubButton, // Not used in this simplified version
  SidebarGroup,
  SidebarGroupLabel,
  // SidebarSeparator, // Not used in this simplified version
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export function MainSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar();

  const isAdmin = user?.role === "Owner" || user?.role === "ADMIN";
  const navItems = ALL_NAV_ITEMS(isAdmin);

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    // For parent items like /projects, also match /projects/new or /projects/[id]
    return pathname.startsWith(href) && (pathname === href || pathname.charAt(href.length) === '/');
  }

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  }

  const renderNavItem = (item: NavItem, isSubItem = false, parentKey?: string) => {
    const active = isActive(item.href, item.href === "/dashboard");
    const buttonClass = cn(
      "justify-start w-full",
      isSubItem ? "text-sm h-8 pl-10 pr-2" : "h-9", // Adjusted padding for sub-items
       active && (item.href.startsWith("/admin") ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90")
    );

    const linkContent = (
      <>
        <item.icon className={cn("h-4 w-4 shrink-0", active ? (item.href.startsWith("/admin") ? "text-destructive-foreground" : "text-primary-foreground") : "text-sidebar-foreground group-hover/menu-button:text-sidebar-accent-foreground")} />
        {sidebarState === 'expanded' && <span className="truncate">{item.label}</span>}
      </>
    );

    if (item.subItems && sidebarState === 'expanded') { // Accordion only makes sense if sidebar is expanded
      return (
        <AccordionItem value={parentKey || item.label} key={parentKey || item.label} className="border-none">
          <AccordionTrigger
            className={cn(
              "flex items-center justify-between w-full rounded-md px-2 py-1.5 text-sm text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline",
              active && (item.href.startsWith("/admin") ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90")
            )}
          >
             <Link href={item.href} onClick={closeMobileSidebar} className="flex items-center gap-2 flex-grow">
                <item.icon className={cn("h-4 w-4 shrink-0", active ? (item.href.startsWith("/admin") ? "text-destructive-foreground" : "text-primary-foreground") : "")} />
                <span className="truncate">{item.label}</span>
             </Link>
          </AccordionTrigger>
          <AccordionContent className="pt-0 pb-0 pl-4"> {/* Removed pb-0 to allow sub-item spacing */}
            <SidebarMenu className="ml-2 border-l border-sidebar-border pl-2 py-1">
              {item.subItems.map((subItem) => renderNavItem(subItem, true, `${parentKey || item.label}-${subItem.label}`))}
            </SidebarMenu>
          </AccordionContent>
        </AccordionItem>
      );
    }
    
    // For items without subItems or when sidebar is collapsed
    return (
      <SidebarMenuItem key={parentKey || item.label}>
        <SidebarMenuButton
          className={buttonClass}
          isActive={active}
          asChild
          tooltip={sidebarState === 'collapsed' ? item.label : undefined}
        >
          <Link href={item.href} onClick={closeMobileSidebar}>
            {linkContent}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };
  
  const defaultOpenAccordions = navItems.reduce((acc, item) => {
    if (item.subItems && isActive(item.href)) {
      acc.push(item.label);
    }
    return acc;
  }, [] as string[]);

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="border-b h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold py-2 px-2 hover:bg-sidebar-accent rounded-md" onClick={closeMobileSidebar}>
            <Layers className="h-7 w-7 text-primary" />
            {sidebarState === 'expanded' && <span className="text-lg font-headline">TensorFlow</span>}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow">
           <Accordion type="multiple" defaultValue={defaultOpenAccordions} className="w-full">
              <SidebarMenu className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  if (item.label === "Admin" && item.subItems) { // Handle Admin group specifically if needed, or treat as regular group
                     return (
                      <SidebarGroup key={item.label} className="p-0 mt-1">
                        {sidebarState === 'expanded' && (
                          <SidebarGroupLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </SidebarGroupLabel>
                        )}
                        {/* If sidebar is collapsed, the top-level Admin link itself should be a tooltip button */}
                         {sidebarState === 'collapsed' && renderNavItem(item, false, `admin-group-parent`)}
                         {sidebarState === 'expanded' && item.subItems.map((subItem) => renderNavItem(subItem, true, `admin-${subItem.label}`))}
                      </SidebarGroup>
                     );
                  }
                  return renderNavItem(item, false, item.label);
                })}
              </SidebarMenu>
           </Accordion>
        </SidebarContent>
        <SidebarFooter className="mt-auto border-t p-2">
          {/* Optional Footer Content */}
        </SidebarFooter>
    </Sidebar>
  );
}
