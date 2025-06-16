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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar" // Using the shadcn sidebar component
import { Button } from "@/components/ui/button"

export function MainSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { state: sidebarState } = useSidebar(); // Get sidebar state

  const isAdmin = user?.role === "Owner" || user?.role === "Project Manager"; // Simplified admin check
  const navItems = ALL_NAV_ITEMS(isAdmin);

  const isActive = (href: string, exact = false) => {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const active = isActive(item.href, item.href === "/dashboard"); // Dashboard is exact match
    const buttonClass = cn(
      "justify-start",
      isSubItem ? "text-sm" : ""
    );

    if (item.subItems) {
      return (
        <SidebarMenuItem key={item.label}>
           <SidebarMenuButton
              isActive={active}
              className={buttonClass}
              asChild
              tooltip={item.label}
            >
             <Link href={item.href}>
              <item.icon className={cn("h-4 w-4", active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover/menu-button:text-sidebar-accent-foreground")} />
              <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          {/* For simplicity, sub-items are not deeply nested in this example with shadcn/sidebar's patterns */}
          {/* If using Accordion: 
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={item.label} className="border-none">
              <AccordionTrigger
                className={cn(
                  buttonClass,
                  "hover:no-underline justify-between w-full [&[data-state=open]>svg]:text-primary",
                  active ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pl-4">
                <SidebarMenuSub>
                  {item.subItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.label}>
                       <SidebarMenuSubButton
                          isActive={isActive(subItem.href)}
                          asChild
                       >
                        <Link href={subItem.href}>
                         {subItem.label}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          */}
        </SidebarMenuItem>
      )
    }

    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton
          className={buttonClass}
          isActive={active}
          asChild
          tooltip={item.label}
        >
          <Link href={item.href}>
            <item.icon className={cn("h-4 w-4", active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover/menu-button:text-sidebar-accent-foreground")} />
             {sidebarState === 'expanded' && <span>{item.label}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
  
  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold py-2 px-2 hover:bg-sidebar-accent rounded-md">
            <Layers className="h-7 w-7 text-primary" />
            {sidebarState === 'expanded' && <span className="text-lg font-headline">TensorFlow</span>}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => {
              if (item.label === "Admin" && item.subItems) {
                 return (
                  <SidebarGroup key={item.label}>
                    <SidebarGroupLabel className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {sidebarState === 'expanded' && item.label}
                    </SidebarGroupLabel>
                    {item.subItems.map((subItem) => renderNavItem(subItem, true))}
                  </SidebarGroup>
                 );
              }
              return renderNavItem(item);
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto border-t p-2">
          {/* Optional Footer Content, e.g., quick settings or help */}
        </SidebarFooter>
    </Sidebar>
  );
}
