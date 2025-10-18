"use client"

import { useState } from "react"
import { ScrollArea } from "./ui/scroll-area"
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
} from "./ui/chat"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import type { EmojiObject } from "./ui/emoji-picker"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Info, Send, SmilePlus} from "lucide-react"
import * as data from "./data"
import { formatShortTime, initials, cn } from "./utils"

interface User {
  id: number
  name: string
  username: string
  img: string
}

interface Message {
  message: string
  senderId: number
  sentAt: string
}

const ChatComponent = () => {
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>(data.messages)
  const [open, setOpen] = useState<boolean>(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() === "") return

    const newMessage: Message = {
      message,
      senderId: data.user.id,
      sentAt: formatShortTime(new Date()),
    }

    setMessages([...messages, newMessage])
    setMessage("")
  }

  const handleEmojiSelect = (emojiObject: EmojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji)
    setOpen(false)
  }

  return (
    <div className="w-full h-full">
      <div className="bg-background flex place-items-center justify-between border-b p-2">
        <div className="flex place-items-center gap-2">
          <Avatar>
            <AvatarImage src={data.friend.img || "/placeholder.svg"} alt={data.friend.username} />
            <AvatarFallback>{initials(data.friend.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{data.friend.name}</span>
            <span className="text-xs">Active 2 mins ago</span>
          </div>
        </div>
        <div className="flex place-items-center">
          <AlertDialog>
            <AlertDialogTrigger><Info /></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Communication Disclaimer: Quality Assurance Notice
                </AlertDialogTitle>
                <AlertDialogDescription>
                  By continuing this conversation, you acknowledge and agree that messages sent through this service are NOT end-to-end encrypted, meaning the message contents are accessible to the system operator (the service provider) on our secure servers. All messages and conversation transcripts are automatically recorded and saved for purposes strictly limited to Quality Assurance (QA), system diagnosis, improving customer service, and model training.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
                <AlertDialogAction>I Understand</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <ScrollArea           
        style={{
            height: '100vh',
            overflowY: 'auto'
          }}>
        <ChatList className="space-y-5">
          {messages.map((msg: Message, index: number) => {
            const sender: User | undefined = data.users.find((u: User) => u.id === msg.senderId)
            const isSent: boolean = msg.senderId === data.user.id
            return (
              <ChatBubble key={index} variant={isSent ? "sent" : "received"}>
                <ChatBubbleAvatar>
                  <ChatBubbleAvatarImage src={sender?.img} alt={sender?.username} />
                  {/* <ChatBubbleAvatarFallback>{initials(sender?.name ?? "")}</ChatBubbleAvatarFallback> */}
                </ChatBubbleAvatar>
                <ChatBubbleMessage className="flex flex-col gap-1">
                  <p>{msg.message}</p>
                  <div className="w-full text-xs group-data-[variant='sent']/chat-bubble:text-end">{msg.sentAt}</div>
                </ChatBubbleMessage>
              </ChatBubble>
            )
          })}
          <ChatBubble variant="received">
            <ChatBubbleAvatar>
              <ChatBubbleAvatarImage src={data.friend.img} alt={data.friend.username} />
              {/* <ChatBubbleAvatarFallback>{initials(data.friend.name)}</ChatBubbleAvatarFallback> */}
            </ChatBubbleAvatar>
            {/* <ChatBubbleMessage typing /> */}
                <ChatBubbleMessage className="flex flex-col gap-1">
                  <p>Could you rate your experience?</p>
                  <div className="w-full text-xs group-data-[variant='sent']/chat-bubble:text-end">12:13 am</div>
                </ChatBubbleMessage>
          </ChatBubble>
        </ChatList>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex sticky bottom-0 left-0 right-0 place-items-center gap-2 p-2 bg-white">
        <InputFile />
        {/* <EmojiPickerRoot
          showRecents
          recentsKey="emoji-picker-recents"
          disableInitialScroll
          onSelect={handleEmojiSelect}
        >
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className={cn("shrink-0 rounded-full")}>
              <SmilePlus />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="top" align="start">
              <EmojiPickerSearch />
              <EmojiPickerList className="h-[175px]" />
              <EmojiPickerFooter className="relative flex max-w-[232px] place-items-center gap-2 px-2">
                {(active: EmojiObject | undefined) => (
                  <>
                    <div className="flex w-[calc(100%-40px)] items-center gap-2">
                      <span className="text-lg">{active?.emoji}</span>
                      <span className="text-muted-foreground truncate text-xs">{active?.data.name}</span>
                    </div>
                    <EmojiPickerSkinToneSelector />
                  </>
                )}
              </EmojiPickerFooter>
            </PopoverContent>
          </Popover>
        </EmojiPickerRoot> */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-full"
          placeholder="Type a message..."
        />
        <Button type="submit" variant="default" size="icon" className="shrink-0 rounded-full" disabled={message === ""}>
          <Send />
        </Button>
      </form>
    </div>
  )
}

export default ChatComponent
