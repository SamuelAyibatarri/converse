import { IdCard, MapPin} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { UseAgentChatState, UseAgentDashboardState } from "@/lib/zus";
import { useEffect, useState } from "react";
import { HTTP_API_URL } from "@/lib/data";
import * as data from "./data"
import { initials } from "./utils";

const UserInfo = () => {
  const [customerDetails, setCustomerDetails] = useState<data.User>();
  const [userDetailsSet, setUserDetailsSet] = useState<boolean>(false);
  const currentCustomerIdZus = UseAgentChatState((state) => state.currentCustomerId);

  const redirect = UseAgentDashboardState((state) => state.updateState);
  function onQueueButtonClick() {
      redirect("queue-page");
  };

    const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user_data") ?? "{}"
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  useEffect(() => {
    if (currentCustomerIdZus != "random" && currentCustomerIdZus.length > 10) {
        async function getCustomerDetails() {            /// Get customer details 
          try {
            const parsed = getStoredUser()
            if (!parsed?.token) {
              console.error("Invalid user details")
              return
            }
            const auth = parsed.token
            const customerId = currentCustomerIdZus;
            if (!customerId) return
      
            const res = await fetch(`${HTTP_API_URL}/api/customer/${customerId}/${auth}`)
            if (!res.ok) throw new Error("Something went wrong fetching agent details")
            const rawCustomerData = await res.json()
            const parsedCustomerData: data.User = {
              id: rawCustomerData.customerData.id,
              name: rawCustomerData.customerData.name,
              username: rawCustomerData.customerData.email,
              email: rawCustomerData.customerData.email,
              img:
                // rawAgentData.agentData.avatar ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBV4aJy3Mt5esX4bbG_yLjW9SLVMLW2CgtZiQU_essZ_pdCgLyx-VQLEJiCSe3EPkapTEqim6RcUVvA2BwXxmF6L0UASuV-EOlPfiwai3BXSudDs42XDawbbotdt-5bbV6-FiRDtMKGKT1dnpXRK_vBG8N5CULiKQBnEwtTtCFeASHltCUG0QqYOgr_ji9jPQetK8Oo3SuLf8xCW2gEHTnFs9VsEcE0gcsRkSz4gs5qDaO6O08BC_laLqaS26y7797vf-GSifD1ASWW",
            }
            setCustomerDetails(parsedCustomerData);
            if (parsedCustomerData.id && parsedCustomerData.name && parsedCustomerData.username) {
              setUserDetailsSet(true)
            }
          } catch (error) {
            console.error("Failed to get customer details:", error)
            setUserDetailsSet(false)
          }
        }

    getCustomerDetails();
    }
  },[currentCustomerIdZus])

  const emptyUser =
      <Empty className="border border-dashed h-50">
        <EmptyHeader className="w-50 h-25">
          <EmptyTitle>No Customer Details To View</EmptyTitle>
          <EmptyDescription>
            Connect with a customer
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={() => { onQueueButtonClick(); }}>
            Queue
          </Button>
        </EmptyContent>
      </Empty>

    const userDetailsComponent = 
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
          {initials(customerDetails?.name ?? "John Doe")}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{customerDetails?.name ?? "John Doe"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{customerDetails?.email ?? "john.doe@example.com"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm pt-2">
        <div className="flex flex-col gap-1">
            <IdCard className="text-gray-500 dark:text-gray-400 h-4 w-4"/>
          <p className="font-medium text-gray-900 dark:text-white">{customerDetails?.id ?? "1234-567-890"}</p>
        </div>
        <div className="flex flex-col gap-1">
          <MapPin className="text-gray-500 dark:text-gray-400 h-4 w-4"/>
          <p className="font-medium text-gray-900 dark:text-white">Nigeria</p>
        </div>
      </div>
    </div>
  return  !userDetailsSet ? emptyUser : userDetailsComponent 
};

export default UserInfo;
