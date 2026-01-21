"use client"

import { RiArrowRightSLine } from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { config } from "@/lib/config"

export function SidebarDocsContent() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const isCategoryActive = (items: ReadonlyArray<{ readonly url: string }>) => {
    return items.some(
      (item) =>
        pathname === item.url ||
        pathname === item.url + "/" ||
        pathname?.startsWith(item.url + "/"),
    )
  }

  const isItemActive = (url: string) => {
    return pathname === url || pathname === url + "/" || pathname?.startsWith(url + "/")
  }

  return (
    <>
      {config.sidebar.groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="pl-2.5">{group.label}</SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5">
            {"items" in group &&
              group.items.map((item) => {
                const isActive = pathname === item.url || pathname === item.url + "/"

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className="data-active:font-normal"
                      render={
                        <Link
                          href={item.url}
                          onClick={() => {
                            if (isMobile) {
                              setOpenMobile(false)
                            }
                          }}
                        />
                      }
                    >
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            {"categories" in group &&
              Object.entries(group.categories).map(([category, items]) => {
                const isActive = isCategoryActive(items)
                return (
                  <Collapsible
                    key={`${category}-${isActive}`}
                    defaultOpen={isActive}
                    className="group"
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger render={<SidebarMenuButton tooltip={category} />}>
                      <RiArrowRightSLine className="transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      <span>{category}</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="mr-0 gap-y-0.5 pr-0 pl-2">
                        {items.map((item) => {
                          const isActive = isItemActive(item.url)
                          return (
                            <SidebarMenuSubItem key={item.url}>
                              <SidebarMenuSubButton
                                isActive={isActive}
                                render={
                                  <Link
                                    href={item.url}
                                    onClick={() => {
                                      if (isMobile) {
                                        setOpenMobile(false)
                                      }
                                    }}
                                  />
                                }
                              >
                                <span>{item.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
