import { UseAgentChatState, UseAgentDashboardState } from "@/lib/zus";
import { Button } from "./ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty";
import { useEffect, useState } from "react";

const PaymentHistory = () => {
    const [userDetailsSet, setUserDetailsSet] = useState<boolean>(false);
    const currentCustomerIdZus = UseAgentChatState((state) => state.currentCustomerId);
    const redirect = UseAgentDashboardState((state) => state.updateState);

    function onQueueButtonClick() {
        redirect("queue-page");
    };

    useEffect(() => {
        if (currentCustomerIdZus != "random" && currentCustomerIdZus.length > 10) {
            setUserDetailsSet(true)
        }
      },[currentCustomerIdZus])

    const emptyUser =
      <Empty className="border border-dashed h-50">
        <EmptyHeader className="w-50 h-auto">
          <EmptyTitle>No Payment History To View</EmptyTitle>
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
      
    const paymentHistory = 
    <div> <div className="space-y-3">
                <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Electricity Bills</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">July 17, 2025</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">₦9,000</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Rent - Monthly</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">June 15, 2025</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">₦29,000</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Rent - Monthly</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">May 15, 2025</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">₦29,000</p>
                </div>
            </div>
            <button className="w-full text-end text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hover:underline cursor-pointer">See More</button></div>

    return ( <div className="space-y-4">
        <p className="text-md font-semibold text-gray-900 dark:text-white">Payment History</p>
        {!userDetailsSet ? emptyUser : paymentHistory} 
    </div>)
}

export default PaymentHistory;