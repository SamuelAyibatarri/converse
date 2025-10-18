import * as React from "react"
import { cn } from "@/lib/utils"

interface ChatListProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatList = React.forwardRef<HTMLDivElement, ChatListProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-4 overflow-y-auto p-4", className)} {...props}>
      {children}
    </div>
  )
})
ChatList.displayName = "ChatList"

type ChatBubbleVariant = "sent" | "received"

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChatBubbleVariant
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("group/chat-bubble flex gap-2", variant === "sent" && "flex-row-reverse", className)}
        data-variant={variant}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ChatBubble.displayName = "ChatBubble"

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatBubbleAvatar = React.forwardRef<HTMLDivElement, ChatBubbleAvatarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex shrink-0", className)} {...props}>
        {children}
      </div>
    )
  },
)
ChatBubbleAvatar.displayName = "ChatBubbleAvatar"

interface ChatBubbleAvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const ChatBubbleAvatarImage = React.forwardRef<HTMLImageElement, ChatBubbleAvatarImageProps>(
  ({ className, ...props }, ref) => {
    return <img ref={ref} className={cn("h-10 w-10 rounded-full object-cover", className)} {...props} />
  },
)
ChatBubbleAvatarImage.displayName = "ChatBubbleAvatarImage"

interface ChatBubbleAvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatBubbleAvatarFallback = React.forwardRef<HTMLDivElement, ChatBubbleAvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ChatBubbleAvatarFallback.displayName = "ChatBubbleAvatarFallback"

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  typing?: boolean
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  ({ className, typing = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg px-4 py-2",
          'group-data-[variant="sent"]/chat-bubble:bg-primary group-data-[variant="sent"]/chat-bubble:text-primary-foreground',
          'group-data-[variant="received"]/chat-bubble:bg-muted',
          className,
        )}
        {...props}
      >
        {typing ? (
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-foreground" />
          </div>
        ) : (
          children
        )}
      </div>
    )
  },
)
ChatBubbleMessage.displayName = "ChatBubbleMessage"

export { ChatList, ChatBubble, ChatBubbleAvatar, ChatBubbleAvatarImage, ChatBubbleAvatarFallback, ChatBubbleMessage }
