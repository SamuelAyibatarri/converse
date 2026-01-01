import { Button } from "./ui/button";
import { PlusCircle, Redo2, CircleSlashIcon, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UseAgentChatState } from "@/lib/zus";
import { useEffect, useState } from "react";

type ActionType = "resolve_chat" | "reset_link" | "block_acc" | "delete_acc" | null;

const ActionTray = () => {
  const [customerIdSet, setCustomerIdSet] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const currentCustomerIdZus = UseAgentChatState((state) => state.currentCustomerId);

  useEffect(() => {
    if (currentCustomerIdZus && currentCustomerIdZus !== "random" && currentCustomerIdZus.length > 10) {
      setCustomerIdSet(true);
    } else {
        setCustomerIdSet(false);
    }
  }, [currentCustomerIdZus]);

  const getDialogContent = () => {
    if (!customerIdSet) {
      return "You have to connect to a user before you can use the action button.";
    }
    
    if (activeAction !== "resolve_chat") {
        return "None of the action trays buttons work on this template (except resolve chat). If you intend to use this codebase as a template, you should modify the action buttons according to your preferences.";
    }

    return "Are you sure you want to perform this action?";
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        Action Tray
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => setActiveAction("resolve_chat")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Resolve
        </Button>
        <Button variant="outline" onClick={() => setActiveAction("reset_link")}>
          <Redo2 className="mr-2 h-4 w-4" /> Reset Link
        </Button>
        <Button
          variant="outline"
          className="border-red-400 text-red-400"
          onClick={() => setActiveAction("block_acc")}
        >
          <CircleSlashIcon className="mr-2 h-4 w-4 text-red-500" /> Block Acc.
        </Button>
        <Button
          variant="outline"
          className="border-red-400 text-red-400"
          onClick={() => setActiveAction("delete_acc")}
        >
          <XCircle className="mr-2 h-4 w-4 text-red-500" /> Delete Acc.
        </Button>
      </div>

      <AlertDialog 
        open={activeAction !== null} 
        onOpenChange={(open) => {
            if (!open) setActiveAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Action Required</AlertDialogTitle>
            <AlertDialogDescription>
              {getDialogContent()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => console.log(`Executed: ${activeAction}`)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActionTray;