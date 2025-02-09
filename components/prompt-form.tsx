import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import CharacterDisplay from './character-display'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => void
  isLoading: boolean
  isComa: any
  character: any,
  username: string
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
  isComa,
  character,
  username
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [showBubble, setShowBubble] = React.useState(false);
  const router = useRouter()
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <>
    

    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        await onSubmit(input)
      }}
      ref={formRef}
    >
      <div className="relative flex flex-col w-full px-12 max-h-60 grow rounded-md border" style={{borderColor:"rgb(200,200,200)"}}>
        {/*<img style={{left:"-20px"}} className={cn(
                'absolute bottom-0 size-30'
              )}  width={'150px'}src='red.png'></img>*/}
        {character&&<div className={cn('absolute bottom-0 size-30')} style={{width:"152px", left:"-20px", aspectRatio:"1/1"}}><CharacterDisplay input={input} username={username} character={character} styles={{}}></CharacterDisplay></div>}
        
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={0}
          value={isComa?"Your story pauses here":input}
          onChange={e => setInput(e.target.value)}
          placeholder={isComa?"Your story pauses here":"Type your action"}
          spellCheck={false}
          disabled={isComa}
          style={{fontFamily:"DM Sans", fontWeight:"700",backgroundColor:'transparent', color:"white"}}
          className="text-lg md:text-lg min-h-[60px] w-full resize-none bg-transparent pl-16 md:pl-16 pr-1 py-[1rem] md:py-[1.1rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute top-4 right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div style={{backgroundColor:"white", padding:'1px', opacity:(isLoading || input === '')?"50%":"100%", borderRadius:"7px"}}>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ''}
              >
                <IconArrowElbow />
                <span className="sr-only">Confirm</span>
              </Button></div>
            </TooltipTrigger>
            <TooltipContent>Confirm</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form></>
  )
}
