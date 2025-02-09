import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'

export interface ChatList {
  messages: Message[]
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null
  }

  // Get the last message from the messages array
  const lastMessage = messages.slice().reverse().find(message => message.role === 'assistant');
  if (!lastMessage){
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      <ChatMessage message={lastMessage} />
    </div>
  )
}

