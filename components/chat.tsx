'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import {textToImage3} from '@/lib/imageGenerator3'


import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import Typing from './typing'
import { getActionSuggestion, getUserData, getUserState, performAction, saveHistory } from '@/app/apis'
import Overlay from './comaoverlay'
import MobileOveraly from './mobile-comaoverlay'
import { MusicWidget } from './music-widget'
import { checkOpenAISupport } from '@/lib/openaiSupport'
import useChecksumAccount from '@/lib/useChecksumAccount'
const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const getPstDateString = ()=>{
    const now = new Date();
    const pstDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
    const dateParts = pstDate.split('/');
    return `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
  }

  const getStoredSignature = () => {
    const storedSignature = localStorage.getItem('signature');
    const dateSigned = localStorage.getItem('dateSigned');
    const currentDate = getPstDateString();

    return dateSigned === currentDate ? storedSignature : '';
  };

  
  function clearStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.parentNode?.removeChild(star);
    });
  }



  interface Character {
    spirit: string;
    clothes: string;
    hair: string;
    face: string;
  }

  const router = useRouter()
  const path = usePathname()
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState("")
  const [health, setHealth] = useState(5);
  const [spiritPower, setSpiritPower] = useState(1);
  const [realmsPoints, setRealmsPoints] = useState(0);
  const [inventory, setInventory] = useState({ healthPotion: 0, spiritPotion: 0, fireTotem: 0 });
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [messageHistory, setMessageHistory] = useState<Message[]>([])
  const { address, isConnecting, isDisconnected } = useChecksumAccount()
  const [character, setCharacter] = useState<Character>();

  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState(getStoredSignature);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages:messageHistory,
      id,
      body: {
        id,
        previewToken
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.remove();
          toast.error(response.statusText)
        }
      },
      /*onFinish() {
        if (!path.includes('chat')) {
          window.history.pushState({}, '', `/chat/${id}`)
        }
      }*/
    })
    //console.log(messages)
  
  const lastMessage = messages.slice().reverse().find(message => message.role === 'assistant');

  const [imageData, setImageData] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [actionSuggestion, setActionSugguestion] = useState<string[]>([]);
  let [lastImageMessageId, setLastImageMessageId] = useState(lastMessage?.id);
  let [lastSuggestMessageId, setLastSuggestMessageId] = useState(lastMessage?.id);
  const [isOpenAISupported, setIsOpenAISupported] = useState<boolean>(true);
  useEffect(() => {
    const checkSupport = async () => {
      const supported = await checkOpenAISupport();
      setIsOpenAISupported(supported);
    };
    checkSupport();
  }, []);
  //console.log(isOpenAISupported)

  const generateResults = async (curAction: string) => {
    if(!address || !signature){
      router.push("/")
      return
    }
    //console.log("resultData", 11111)

    const resultData = await performAction(address, curAction, actionHistory, messages, signature, isOpenAISupported)
    //console.log("resultData", resultData)
  
    // Update states
    setHealth(resultData.new_state.health);
    setRealmsPoints(resultData.new_state.points);
    setSpiritPower(resultData.new_state.level);
    setActionHistory(actionHistory => [...actionHistory, curAction]);
  
    const statusChangeJson = {
      isPositive: resultData.state_changes.success,
      spiritPower: resultData.state_changes.level,
      points: resultData.state_changes.points,
      health: resultData.state_changes.health,
    }

    if (resultData.state_changes.success){
      // return `Positive: `+spiritString + (itemsString?", New Items:"+itemsString:""); // Realms Shards: +${newPoints-realmsPoints}, 
      return {
        json: statusChangeJson,
        str: `Positive: `+ JSON.stringify(resultData.state_changes)
      }
    }
    // Check for coma condition

    if (resultData.new_state.health <= 0) {
      // handle coma scenario
      return {
        json: statusChangeJson,
        str: `Negative: ` + JSON.stringify(resultData.state_changes) + `, user fallen into a coma because out of health`
      }
    }
    else{
      return {
        json: statusChangeJson,
        str: `Negative: ` + JSON.stringify(resultData.state_changes)
      }
      
    }
    // Format the results to be displayed in the message
  };

  useEffect(()=>{
    if(!isLoading){
      const addressSigned = localStorage.getItem('addressSigned');
      if(!address || !signature || address != addressSigned){
        return;
      }
      if(messages.length>2){
        //console.log("savingHistory", messages)
        saveHistory(address, messages, signature)
      }
    }
    else{
      setActionSugguestion([])
    }
  }, [isLoading])

  useEffect(() => {
    if (!imageLoading && messages.at(-1)?.role==='assistant'&& lastMessage && lastMessage.content.length>150 && lastMessage.id !== lastImageMessageId){
      //console.log(lastMessage)
      //console.log(lastMessage.id, lastImageMessageId)
      //console.log(messages.length)
      //lastImageMessageId = lastMessage.id;
      if (messages.length>2){
        setLastImageMessageId(lastMessage.id);
        setImageLoading(true)
        textToImage3(lastMessage.content, isMobile)
          .then((data) => {
            setImageData(data[0]?.base64); 
            setLastImageMessageId(lastMessage.id);
            setImageLoading(false);
            ////console.log("generated", data[0]?.base64)
          })
          .catch((error) => {
            console.error('Error generating image:', error);
          });
      }
    }
  }, [lastMessage, isLoading]);

  useEffect(() => {
    if (messages.at(-1)?.role==='assistant'&& lastMessage && (lastMessage.content.length>450 || !isLoading) && lastMessage.id !== lastSuggestMessageId){
      
      if(!address || !signature){
        return;
      }
      setLastSuggestMessageId(lastMessage.id);
      getActionSuggestion(address, lastMessage.content, actionHistory, spiritPower, signature, isOpenAISupported).then((data)=>{
        //console.log("action_suggestion", data.action_suggestion)
        setActionSugguestion(data.action_suggestion)
      })
      
    }
  }, [lastMessage, isLoading]);

  useEffect(() => {
    clearStars();
    document.body.style.backgroundImage = `url('sample1.png')`;
    document.body.style.backgroundSize = 'cover'; // Cover the entire page
    document.body.style.backgroundRepeat = 'no-repeat'; // Do not repeat the image
    document.body.style.overflow = 'hidden';

    function handleResize() {
      setIsMobile(window.innerWidth <= 768); // Assuming 768px as a breakpoint for mobile
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getAndLoadUserData = async () => {
    if(!address || !signature || userDataLoaded){
      return 
    }
    const userData = await getUserData(address, signature)
    //console.log("resultData", userData)
    setHealth(userData.state.health)
    setSpiritPower(userData.state.level)
    setRealmsPoints(userData.state.points)
    setCharacter(userData.character)
    setUsername(userData.username)


    if(!userData.chat_history){
      const newMessage: Message = {
        id: id?id:"",
        content: "PLEASE KEEP EACH RESPONSE SHORT UNDER 70 words: This world is called The Five Realms. This is a fantasy world based on The five elements: Metal, Wood, Water, Fire, Earth. The character is in the Water Realm. You will act as a narrator and game master for a text-based adventure game. You will set the scene, describe the environment, and narrate the consequences of the player's actions, and lead the following story, including the key elements of novel writing: Goal, Obstacle, Effort, Result, Surprise, and Twist. After each player's action, user will provide you the action and the result, for example: 'Action: [action], Results: [results]'. one third of the time, incorporate unexpected encounters with creatures from water realm to enrich the adventure, ensuring that each narrative segment captivates with a coherent and evolving plot. . You will try to explain what happens that lead to the result and provide some hint in the scene to allow user to explore next, do not give options, subtly guiding them through environmental hints. You will ensure that the narrative is coherent, engaging, and progresses logically based on the player's previous actions. For each round, you should explain what happened after the action and let the status change make sense, then lead the story with some environmental hint. Do not give options. Do not provide current status or status change for user.  Do not Repeat users Action, Just give the story without any formatting directly. Try to lead the story with new things in the environment. Try to drive user's curiorsity. one third of the time, there should be some creature or animals in the fantasy realm pop up, describe it to the player. For Actions that are not english but valid, just treat it as english, and return response in English. PLEASE KEEP EACH RESPONSE SHORT UNDER 70 words. Do NOT Ask user what they want to do. Just Describe tell the story like novel.",
        role: 'system'
      };
      const newMessage2: Message = {
        id: id?id:"",
        content: "Welcome to The Five Realms. You find yourself in the serene, flowing Water Realm, a land of shimmering seas and hidden coral kingdoms. Your mission is to build your experience, level up, and gain recognition from the elemental spirits of water. As you stand at the edge of a misty shore, the cool waves lap against your feet, and the air is thick with the briny scent of salt and seaweed. Your journey begins here, amidst the gentle murmur of tides and the distant roar of cascading waterfalls.",
        role: 'assistant'
      };
      setMessageHistory([newMessage, newMessage2])
    }
    else{
      setMessageHistory(userData.chat_history)
    }
    setUserDataLoaded(true)
  }

  useEffect(() => {
    const addressSigned = localStorage.getItem('addressSigned');
    if(!address || addressSigned != address || !signature){
      router.push("/")
      toast.remove();
      toast.error("Please click ENTER to sign in")
      return
    } 
    
    else{
      // get and load user data
      getAndLoadUserData()
    }
  }, [useChecksumAccount()]);

  useEffect(() => {
    // Set the background image of the entire page when imageData changes
    if (imageData) {
      const imageUrl = imageData.includes("https")?imageData:imageData.includes("base64")?imageData:`data:image/png;base64,${imageData}`
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = 'cover'; // Cover the entire page
      document.body.style.backgroundRepeat = 'no-repeat'; // Do not repeat the image
      document.body.style.overflow = 'hidden'; // Do not repeat the image
      document.body.style.backgroundPosition = 'center center';
    }

    // Clean up function to reset the background when the component unmounts
    return () => {
      document.body.style.backgroundImage = `url('sample1.png')`;
      document.body.style.backgroundSize = 'cover'; // Cover the entire page
      document.body.style.backgroundRepeat = 'no-repeat'; // Do not repeat the image
      document.body.style.overflow = 'hidden';
      document.body.style.backgroundPosition = 'center center';
    };
  }, [imageData]);

  return (
    <>
      <div style={{color:"white",scrollbarWidth:"none"}} className={cn('pt-1 md:pt-5 overflow-scroll', className)}>
        {lastMessage && (
          <>
            {/*<EmptyScreen imageData={imageData}/>*/}
            <div className="relative mx-auto my-auto max-w-2xl px-4">
            <style>
                {`
                  .pt-container {
                    margin-top:5%
                    scrollbar-width: 5px;
                  }
                  @media (min-width: 768px) {
                    .pt-container {
                      margin-top:10%
                    }
                  }
                `}
              </style>
            <div style={{height:"50vh", overflow:"scroll", scrollbarWidth:"none", flexDirection:"column"}}
              className={cn('pt-container group relative flex md:-ml-12')}
            >
              <>
              <style>
                {`
                  .responsive-text {
                    font-size: 15px;
                    font-weight: 600;
                    opacity: 0.85;
                    
                  }
                  @media (min-width: 768px) {
                    .responsive-text {
                      font-size: 20px;
                      
                    }
                  }
                `}
              </style>
              
              <div style={{color:"white"}} key={lastMessage?lastMessage.content:""} className="responsive-text flex-1 px-1 ml-1 space-y-2 text-start mx-auto font-dm-sans">
                <div key={"111"+lastMessage?lastMessage.content:""}>{lastMessage?lastMessage.content:""}</div>
                {lastMessage.content.includes("Welcome to The Five Realms.") && <div style={{color:"white", marginTop:"20px", fontWeight:"300", fontStyle:"italic"}} className="px-1 font-dm-sans">
                {`Type your action to play, such as:`}
                </div>}
                {!isLoading && actionSuggestion.map((action)=>{
                 //console.log(action)
                  return (
                    <div className='text-sm inline-flex items-center justify-center h-8 px-2' onClick={() => { setInput(action) }} style={{ opacity:"90%", marginRight:"10px",fontFamily: "DM Sans", cursor: "pointer", marginTop: "10px", borderRadius: "3px", borderWidth:"1px", borderColor:"white", backgroundColor: "transparent", color: "white", fontWeight: "500", fontSize: "18px" }} key={action}>{action}</div>
                  )
                })}
              </div>
              
              </>
              
            </div>
            </div>
          </>
        )}
      </div>
      {/*<h1>{signature}</h1>*/}
      {/*<div style={{marginTop:"auto"}}> </div>
     */}
      <MusicWidget></MusicWidget>
      <ChatPanel
        username={username}
        id={id}
        isLoading={isLoading || health<=0}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        generateResults={generateResults}
        health={health}
        realmsPoints={realmsPoints}
        spiritPower={spiritPower}
        inventory={inventory}
        isComa={health<=0}
        imageLoading={imageLoading}
        character={character}
      />
      {health<=0 && (isMobile?<MobileOveraly/>:<Overlay/>)}

    </>
  )
}
