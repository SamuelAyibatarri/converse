import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  MessageSquareOff,
  AlertCircle,
  Hash
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; 
import { 
  Avatar, 
  AvatarFallback 
} from "@/components/ui/avatar";

// --- INTERFACES (Based on your provided types) ---

interface Message {
  readonly id: string;
  readonly thread_id: string;
  readonly sender_id: string;
  readonly content: string;
  readonly timestamp: number;
}

// The UI Data Structure
interface ConversationData {
  id: string;
  name: string;
  profilePicUrl: string;
  messagePreview: string;
  timestamp: number;
  displayDate: string;
  fillerColor: string;
}

// Raw response from /api/history
interface HistoryRow {
  user_id: string;
  thread_id: string;
}

// Raw response from /api/chatData
interface ChatDataResponse {
  threadId: string;
  messages: Message[];
  error?: string;
}

// --- HELPERS ---

const getFillerColor = (id: string) => {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", 
    "bg-green-500", "bg-emerald-500", "bg-teal-500", 
    "bg-cyan-500", "bg-blue-500", "bg-indigo-500", 
    "bg-violet-500", "bg-purple-500", "bg-pink-500"
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  
  // Check if it's today
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// --- COMPONENTS ---

function HistoryControls({
  searchValue,
  onSearchChange,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Ticket ID..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button variant="outline" className="gap-2 shrink-0">
        <Calendar className="h-4 w-4" />
        Date
      </Button>
    </div>
  );
}

function ConversationItem({ item, onClick }: { item: ConversationData; onClick: (id: string) => void }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
      onClick={() => onClick(item.id)}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className={`${item.fillerColor} text-white`}>
            <Hash className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center overflow-hidden gap-0.5">
          <p className="text-sm font-medium leading-none truncate font-mono">
            {item.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {item.messagePreview}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <p className="text-xs text-muted-foreground">
          {item.displayDate}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col divide-y">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <MessageSquareOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-2 text-lg font-semibold text-foreground">
        No conversations found
      </h3>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function ChatHistorySection() {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get Auth Data safely
  let userId = '';
  let token = '';
  try {
    const rawData = localStorage.getItem('user_data');
    if (rawData) {
      const userData = JSON.parse(rawData);
      userId = userData?.userData?.id || '';
      token = userData?.token || '';
    }
  } catch (e) {
    console.error("Error parsing local storage", e);
  }

  useEffect(() => {
    async function fetchHistoryAndDetails() {
      if (!userId || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. Fetch the list of Thread IDs
        const historyRes = await fetch(`http://localhost:8787/api/history/${userId}/${token}`);
        if (!historyRes.ok) throw new Error('Failed to fetch history list');
        
        const historyJson = await historyRes.json();
        
        if (historyJson.success && Array.isArray(historyJson.data)) {
          const threads: HistoryRow[] = historyJson.data;

          // 2. Fetch details for EVERY thread in parallel (Client-side Join)
          const detailPromises = threads.map(async (row) => {
            try {
              const chatRes = await fetch(`http://localhost:8787/api/chatData/${row.thread_id}/${token}`);
              
              if (!chatRes.ok) return null; // Skip failed fetches
              
              const chatJson: ChatDataResponse = await chatRes.json();
              
              // Find the latest message for preview (Last item in array usually)
              const msgs = chatJson.messages || [];
              const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

              return {
                threadId: row.thread_id,
                lastMessage: lastMsg
              };
            } catch (err) {
              console.warn(`Failed to fetch details for thread ${row.thread_id}`, err);
              return null;
            }
          });

          // Wait for all requests to finish
          const detailsResults = await Promise.all(detailPromises);

          // 3. Map to UI
          const mappedData: ConversationData[] = threads.map((row) => {
            // Find the details we just fetched
            const details = detailsResults.find(d => d?.threadId === row.thread_id);
            const msg = details?.lastMessage;

            return {
              id: row.thread_id,
              // Filler Name (Ticket #ID)
              name: `Ticket #${row.thread_id.slice(0, 8)}`,
              profilePicUrl: '', 
              // Actual Message Data or Filler
              messagePreview: msg ? msg.content : 'No messages yet',
              timestamp: msg ? msg.timestamp : Date.now(),
              displayDate: formatTimestamp(msg ? msg.timestamp : Date.now()),
              fillerColor: getFillerColor(row.thread_id)
            };
          });

          // Sort by newest message first
          mappedData.sort((a, b) => b.timestamp - a.timestamp);
          
          setConversations(mappedData);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error("Failed to load history", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHistoryAndDetails();
  }, [userId, token]);

  const handleConversationClick = (id: string) => {
    console.log('Opening conversation:', id);
  };

  const filteredConversations = conversations.filter(
    (convo) =>
      convo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.messagePreview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex w-full items-center justify-center p-8 text-red-500 gap-2 border border-red-200 rounded-lg bg-red-50">
        <AlertCircle className="h-5 w-5" />
        <span>Error loading chats: {error}</span>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 p-4">
      <HistoryControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="flex flex-col divide-y">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((item) => (
                <ConversationItem
                  key={item.id}
                  item={item}
                  onClick={handleConversationClick}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        )}
      </div>
    </div>
  );
}