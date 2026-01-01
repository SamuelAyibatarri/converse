import ChatComponent  from "@/components/chat-component" ;
import { Toaster }  from "@/components/ui/sonner"
function App() {

  return (
    <>
    <div className="max-h-full">
      <ChatComponent />
      <Toaster />
    </div>
    </>
  )
}

export default App
