import { useEffect, useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FormEvent } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { InputFile } from "./file-input"
import {
  ChatList,
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleAvatarImage,
  ChatBadge
} from "./ui/chat"
import { EmptyOutline } from "./no-active-chat"
import { Send } from "lucide-react"
import * as data from "./data"
import { formatShortTime } from "./utils"
import { HTTP_API_URL } from "@/lib/data"
import { useTriggerStore, UseAgentChatState, UseAgentDashboardState } from "@/lib/zus"

const ChatComponent = () => {
  const [message, setMessage] = useState<string>("");
  const [userData, setUserData] = useState<data.APIResponseUserData>(data.defaultAPIResponseUserData);
  const [userDataSet, setUserDataSet] = useState<boolean>(false)
  const [authToken, setAuthToken] = useState<string>("")
  const [messagesState, setMessages] = useState<data.Message[]>([]);
  const [status, setStatus] = useState<boolean>(false);

  /// :::::::::::::::::::: Refs ::::::::::::::::::::::
  const socketRef = useRef<WebSocket | null>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null)
  
  /// Zustand
  const connectWsSignal = useTriggerStore((state) => state.connectWsSignal);
  const currentCustomerIdZus = UseAgentChatState((state) => state.currentCustomerId);
  const currentThreadIdZus = UseAgentChatState((state) => state.currentThreadId);
  const redirectToChat = UseAgentDashboardState((state) => state.updateState);

  useEffect(() => {
    if(currentThreadIdZus) {
      redirectToChat("chat-page")
    }
  },[currentCustomerIdZus, currentThreadIdZus, redirectToChat])

  useEffect(() => {
    if (connectWsSignal > 0) {
      connectAgentToCustomer();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectWsSignal]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messagesState])
  
  function connectWebSocket() {
        if (socketRef.current) socketRef.current.close();
        if (!userData.token || !currentThreadIdZus) return;

        socketRef.current = new WebSocket(`ws://localhost:8787/api/chat/${currentThreadIdZus}/ws?token=${userData.token}`)
        
        socketRef.current.addEventListener('open', () => {
          setStatus(true);
        });

        socketRef.current.addEventListener('close', () => {
          setStatus(false);
        });

        socketRef.current.addEventListener('message', (msg) => {
          const parsed = JSON.parse(msg.data);
          
          if (parsed.type === 'history') {
            const historyArr = parsed.messages.map((item: any) => ({
                message: item.content,
                senderId: item.sender_id,
                sentAt: formatShortTime(new Date(item.timestamp))
            }))
            setMessages(historyArr)
          } 

          if (parsed.type === 'message') {
            if (parsed.sender_id === userData.userData.id) return;

            const incomingMsg: data.Message = {
              message: parsed.content,
              senderId: parsed.sender_id,
              sentAt: formatShortTime(new Date(parsed.timestamp))
            }
            setMessages((prevMessages) => [...prevMessages, incomingMsg]);
          }
      })
  };

  async function loadUserData(): Promise<boolean> {
    const raw = localStorage.getItem("user_data") ?? "";
    if (!raw || raw.length < 0) return false;
    const parsed = JSON.parse(raw);
    if (parsed) {
      setUserData(parsed);
      setUserDataSet(true)
      setAuthToken(parsed.token as string);
      return true;
    } 
    return false;
  }

  async function loadChatHistory(threadId: string): Promise<boolean> {
    if (!threadId) return false;
    try {
      const res = await fetch(`${HTTP_API_URL}/api/chatData/${threadId}/${authToken}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const rawThreadHistory: data.API_CHAT_DATA = await res.json() ?? []
      if (!rawThreadHistory?.messages) return false;
      const threadHistory: data.Message[] = rawThreadHistory.messages.map(msg => ({
        message: msg.content,
        senderId: msg.sender_id,
        sentAt: formatShortTime(new Date(msg.timestamp))
      }));
      setMessages(threadHistory); 
    } catch (error) {
      console.error("Error loading history:", error);
      return false;
    }
    return true
  }

  async function sendMessage(msgContent: string) {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && userData?.userData && currentCustomerIdZus) {
      const payload = JSON.stringify({
        content: msgContent,
        senderId: userData.userData.id,     
        receiverId: currentCustomerIdZus 
      })
      socketRef.current.send(payload);
    } else {
      console.error("WebSocket not ready");
    }
  }

  async function connectAgentToCustomer() {
    if (!currentThreadIdZus) return;
    connectWebSocket(); 
    await loadChatHistory(currentThreadIdZus); 
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() === "") return
    const newMessage: data.Message = {
      message,
      senderId: userData.userData.id,
      sentAt: formatShortTime(new Date()),
    }
    await sendMessage(message); 
    setMessages((prev) => [...prev, newMessage])
    setMessage("")
  }

  useEffect(() => {
    if (!userDataSet) loadUserData();
  }, [userDataSet]) 

  const chatArea =  (
    <ScrollArea 
        className="grow rounded-xl *:data-radix-scroll-area-viewport:h-full [&>[data-radix-scroll-area-viewport]>div]:h-full **:data-radix-scroll-area-scrollbar:hidden!"
        style={{ height: '50%' }}
    >
        <ChatList className="space-y-5 bg-gray-100 flex-1 h-full">
          <ChatBadge />
          {messagesState.map((msg: data.Message, index: number) => {
            const sender: data.Agent | undefined = data.participants.find((u: data.User) => u.id === msg.senderId)
            const isSent: boolean = msg.senderId === userData.userData.id;
            
            return (
              <ChatBubble key={index} variant={isSent ? "sent" : "received"}>
                <ChatBubbleAvatar>
                  <ChatBubbleAvatarImage src={sender?.img} alt={sender?.username} />
                </ChatBubbleAvatar>
                <ChatBubbleMessage className="flex flex-col gap-1">
                  <p className="text-[14px]">{msg.message}</p>
                  <div className="w-full text-xs group-data-[variant='sent']/chat-bubble:text-end">{msg.sentAt}</div>
                </ChatBubbleMessage>
              </ChatBubble>
            )
          })}
          <div ref={scrollBottomRef} />
        </ChatList>
      </ScrollArea>
  );

  const inactiveChat = <EmptyOutline />;

  return (
    <div className="w-full h-[85vh] flex flex-col">
      {status ? chatArea : inactiveChat}
      <form onSubmit={handleSubmit} className="flex relative bottom-0 left-0 right-0 place-items-center gap-2 pt-2 bg-white">
        <InputFile />
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-full"
          placeholder="Type a message..."
        />
        <Button type="submit" variant="default" size="icon" className="shrink-0 rounded-full" disabled={!status}>
          <Send />
        </Button>
      </form>
    </div>
  )
}

export default ChatComponent