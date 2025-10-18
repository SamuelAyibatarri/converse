import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"

interface EmojiObject {
  emoji: string
  data: {
    name: string
  }
}

interface EmojiPickerContextValue {
  onSelect?: (emoji: EmojiObject) => void
  activeEmoji?: EmojiObject
  setActiveEmoji?: (emoji: EmojiObject) => void
}

const EmojiPickerContext = React.createContext<EmojiPickerContextValue>({})

interface EmojiPickerRootProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: (emoji: EmojiObject) => void
  showRecents?: boolean
  recentsKey?: string
  disableInitialScroll?: boolean
}

const EmojiPickerRoot = React.forwardRef<HTMLDivElement, EmojiPickerRootProps>(
  ({ onSelect, children, ...props }, ref) => {
    const [activeEmoji, setActiveEmoji] = React.useState<EmojiObject>()

    return (
      <EmojiPickerContext.Provider value={{ onSelect, activeEmoji, setActiveEmoji }}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </EmojiPickerContext.Provider>
    )
  },
)
EmojiPickerRoot.displayName = "EmojiPickerRoot"

interface EmojiPickerSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const EmojiPickerSearch = React.forwardRef<HTMLInputElement, EmojiPickerSearchProps>(({ className, ...props }, ref) => {
  return (
    <div className="border-b p-2">
      <Input ref={ref} placeholder="Search emoji..." className={cn("h-8", className)} {...props} />
    </div>
  )
})
EmojiPickerSearch.displayName = "EmojiPickerSearch"

// Sample emoji data - in a real app, you'd use a comprehensive emoji library
const EMOJI_DATA = [
  { emoji: "😀", data: { name: "grinning face" } },
  { emoji: "😃", data: { name: "grinning face with big eyes" } },
  { emoji: "😄", data: { name: "grinning face with smiling eyes" } },
  { emoji: "😁", data: { name: "beaming face with smiling eyes" } },
  { emoji: "😆", data: { name: "grinning squinting face" } },
  { emoji: "😅", data: { name: "grinning face with sweat" } },
  { emoji: "🤣", data: { name: "rolling on the floor laughing" } },
  { emoji: "😂", data: { name: "face with tears of joy" } },
  { emoji: "🙂", data: { name: "slightly smiling face" } },
  { emoji: "🙃", data: { name: "upside down face" } },
  { emoji: "😉", data: { name: "winking face" } },
  { emoji: "😊", data: { name: "smiling face with smiling eyes" } },
  { emoji: "😇", data: { name: "smiling face with halo" } },
  { emoji: "🥰", data: { name: "smiling face with hearts" } },
  { emoji: "😍", data: { name: "smiling face with heart-eyes" } },
  { emoji: "🤩", data: { name: "star-struck" } },
  { emoji: "😘", data: { name: "face blowing a kiss" } },
  { emoji: "😗", data: { name: "kissing face" } },
  { emoji: "😚", data: { name: "kissing face with closed eyes" } },
  { emoji: "😙", data: { name: "kissing face with smiling eyes" } },
  { emoji: "👍", data: { name: "thumbs up" } },
  { emoji: "👎", data: { name: "thumbs down" } },
  { emoji: "👏", data: { name: "clapping hands" } },
  { emoji: "🙌", data: { name: "raising hands" } },
  { emoji: "👐", data: { name: "open hands" } },
  { emoji: "🤝", data: { name: "handshake" } },
  { emoji: "🙏", data: { name: "folded hands" } },
  { emoji: "✨", data: { name: "sparkles" } },
  { emoji: "💖", data: { name: "sparkling heart" } },
  { emoji: "💕", data: { name: "two hearts" } },
  { emoji: "💓", data: { name: "beating heart" } },
  { emoji: "💗", data: { name: "growing heart" } },
  { emoji: "❤️", data: { name: "red heart" } },
  { emoji: "🧡", data: { name: "orange heart" } },
  { emoji: "💛", data: { name: "yellow heart" } },
  { emoji: "💚", data: { name: "green heart" } },
  { emoji: "💙", data: { name: "blue heart" } },
  { emoji: "💜", data: { name: "purple heart" } },
  { emoji: "🔥", data: { name: "fire" } },
  { emoji: "⭐", data: { name: "star" } },
]

interface EmojiPickerListProps extends React.HTMLAttributes<HTMLDivElement> {}

const EmojiPickerList = React.forwardRef<HTMLDivElement, EmojiPickerListProps>(({ className, ...props }, ref) => {
  const { onSelect, setActiveEmoji } = React.useContext(EmojiPickerContext)

  return (
    <div ref={ref} className={cn("grid grid-cols-8 gap-1 overflow-y-auto p-2", className)} {...props}>
      {EMOJI_DATA.map((emojiObj, index) => (
        <button
          key={index}
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
          onClick={() => onSelect?.(emojiObj)}
          onMouseEnter={() => setActiveEmoji?.(emojiObj)}
        >
          <span className="text-xl">{emojiObj.emoji}</span>
        </button>
      ))}
    </div>
  )
})
EmojiPickerList.displayName = "EmojiPickerList"

interface EmojiPickerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: (active: EmojiObject | undefined) => React.ReactNode
}

const EmojiPickerFooter = React.forwardRef<HTMLDivElement, EmojiPickerFooterProps>(
  ({ className, children, ...props }, ref) => {
    const { activeEmoji } = React.useContext(EmojiPickerContext)

    return (
      <div ref={ref} className={cn("border-t p-2", className)} {...props}>
        {typeof children === "function" ? children(activeEmoji) : children}
      </div>
    )
  },
)
EmojiPickerFooter.displayName = "EmojiPickerFooter"

interface EmojiPickerSkinToneSelectorProps extends React.HTMLAttributes<HTMLDivElement> {}

const EmojiPickerSkinToneSelector = React.forwardRef<HTMLDivElement, EmojiPickerSkinToneSelectorProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button ref={ref} variant="ghost" size="icon" className={cn("h-8 w-8", className)} {...props}>
        <span className="text-lg">👋</span>
      </Button>
    )
  },
)
EmojiPickerSkinToneSelector.displayName = "EmojiPickerSkinToneSelector"

export { EmojiPickerRoot, EmojiPickerSearch, EmojiPickerList, EmojiPickerFooter, EmojiPickerSkinToneSelector }
export type { EmojiObject }
