import * as React from "react"
import UserInfo from "./UserInfo"
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import ActionTray from "./action-tray"
import PaymentHistory from "./payment-history"

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh lg:flex bg-white"
      {...props}
    >
      <SidebarContent className="mt-4 mr-2 flex scroll-m-0 pl-2 pr-2" style={{
        scrollbarWidth: "none"
      }}>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Customer Details</h3>
        <UserInfo />
        <PaymentHistory />
        <ActionTray />
      </SidebarContent>
    </Sidebar>
  )
}
