import ChatComponent  from "@/components/chat-component" ;
import { sendMessage } from "./server";
import { Button } from "./components/ui/button";
import { Toaster }  from "@/components/ui/sonner"
function App() {

  return (
    <>
    <div className="max-h-full">
      <ChatComponent />
      <Toaster />
      {/* <Button onClick={sendMessage}>Click me</Button> */}
    </div>
    </>
  )
}

export default App
