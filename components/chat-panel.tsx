import * as React from 'react'
import { type UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconShare, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'

interface Character {
  spirit: string;
  clothes: string;
  hair: string;
  face: string;
}

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
  > {
  id?: string
  title?: string
  generateResults?: any
  health?: any
  realmsPoints?: any
  spiritPower?: any
  inventory?: any
  isComa?: any
  imageLoading?: any
  character?:any
  username:string
}

interface StatusChangeProps {
  curResults?: {
    isPositive: boolean;
    spiritPower: number;
    points: number;
    health: number;
    items: string[]; // Assuming items is an array of strings for this example
  };
  isLoading: boolean;
}

const StatusChange: React.FC<StatusChangeProps> = ({ curResults, isLoading }) => {
  if (!curResults) {
    return
  }
  const { spiritPower, points, health, items } = curResults;

  return (
    <div className="flex mt-2 items-center justify-center h-12" style={{ color: "white", fontWeight: "500" }}>
      {!isLoading && (
        <div className="flex items-center space-x-4">
          {health !== 0 && (
            <div className="flex items-center">
              <img src={"./heart-wings.svg"} style={{ height: "36px", marginRight: "3px" }} alt="Health" />
              <span style={{fontFamily:"GLY", fontSize:"1.5rem"}}>{`${health > 0 ? '+' : ''}${health}`}</span>
            </div>
          )}
          {spiritPower !== 0 && (
            <div className="flex items-center">
              <img src={"./fist.svg"} style={{ height: "25px", marginRight: "3px" }} alt="Spirit Power" />
              <span style={{fontFamily:"GLY", fontSize:"1.5rem"}}>{`${spiritPower > 0 ? '+' : ''}${spiritPower}`}</span>
            </div>
          )}
          {points !== 0 && (
            <div className="flex items-center">
              <img src={"./flamer.svg"} style={{ height: "25px", marginRight: "3px" }} alt="Points" />
              <span style={{fontFamily:"GLY", fontSize:"1.5rem"}}>{`${points > 0 ? '+' : ''}${points}`}</span>
            </div>
          )}


        </div>
      )}
    </div>
  );
};




export function ChatPanel({
  id,
  title,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
  generateResults,
  health,
  realmsPoints,
  spiritPower,
  inventory,
  isComa,
  imageLoading,
  character,
  username
}: ChatPanelProps) {
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [curResults, setCurResults] = React.useState({ json: undefined })

  //console.log(character, realmsPoints, spiritPower)

  return (
    <div style={{}} className="fixed inset-x-0 bottom-0 w-full animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <div style={{ maxWidth: "50rem" }} className="mx-auto sm:max-w-2xl sm:px-4">
        <StatusChange curResults={curResults && curResults.json} isLoading={isLoading}></StatusChange>
        <div className="flex items-center justify-end h-12">
          {(!isLoading || isComa) &&
            <div className="flex space-x-2" style={{ color:"white",paddingRight: "20px", marginBottom: "-10px" }}>

              <style> {`
              @media (max-width: 600px) {
                .responsive-button-heart img {
                  height: 25px; /* Smaller height for mobile */
                }
                .responsive-button img {
                  height: 20px; /* Smaller height for mobile */
                  margin-left:-5px;
                }
                .responsive-button span {
                  font-size: 1rem; /* Smaller font size for text on mobile */
                }
                .responsive-button-heart span {
                  font-size: 1rem;
                }
              }

              /* Desktop styles */
              @media (min-width: 601px) {
                .responsive-button-heart img {
                  height: 40px; /* Larger height for desktop */
                }
                .responsive-button img {
                  height: 28px; /* Larger height for desktop */
                }
                .responsive-button-heart span {
                  font-size: 1.5rem;
                }
                .responsive-button span {
                  font-size: 1.5rem; /* Default font size for text on desktop */
                }
              } `}
              </style>

              <Button variant="ghost" className='text-lg pointer-events-none responsive-button-heart' style={{ padding: "3px" }}>
                <img src={'./heart-wings.svg'} style={{ marginRight: "5px" }} alt="Health" />
                <span style={{fontFamily:"GLY"}}>{`${health}/5`}</span>
              </Button>
              <Button variant="ghost" className='text-lg pointer-events-none responsive-button' style={{ padding: "3px" }}>
                <img src={'./fist.svg'} style={{ marginRight: "5px" }} alt="Strength" />
                <span style={{fontFamily:"GLY"}}>{`Lv. ${spiritPower}`}</span>
              </Button>
              <Button variant="ghost" className='text-lg pointer-events-none responsive-button' style={{ padding: "3px" }}>
                <img src={'./flamer.svg'} style={{ marginRight: "5px" }} alt="Power" />
                <span style={{fontFamily:"GLY"}}>{`${realmsPoints.toLocaleString()}`}</span>
              </Button>

            </div>}

        </div>
        <div style={{ backgroundColor: "transparent" }} className="px-4 py-2 space-y-4 shadow-lg sm:rounded-t-xl md:py-4">
          <PromptForm
            username={username}
            onSubmit={async value => {
              const results = await generateResults(value);
              setCurResults(results);
              //console.log("resultData", results)
              await append({
                id,
                content: "Action: [" + value + "], Results: [" + results.str + "]",
                role: 'user'
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading || imageLoading}
            isComa={isComa}
            character={character}
          />
        </div>
      </div>
    </div>
  )
}
