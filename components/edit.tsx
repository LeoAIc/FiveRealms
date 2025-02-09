'use client'
// pages/index.tsx
import { ChangeEvent, useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from './ui/button';
import { Input } from "./ui/input"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import toast from 'react-hot-toast';
import { editAPI, getUserData } from '@/app/apis';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import useChecksumAccount from '@/lib/useChecksumAccount';


interface Asset {
    [key: string]: string[];
}

const assets: Asset = {
    spirit: ['bear', 'calf', 'cow', 'antelope', 'fawn', 'maine-coon', 'rabbit', 'duck', 'sheep'],
    clothes: ['turtleneck-gray', 'travel-cloak', 'miner-armor', 'bone-tunic', 'harlequin-bubble', 'pumpkin', 'ranger-leather-armor', 'shawl', 'leather-tunic', 'strap-vest', 'fishbone-vest', 'leather-armor'],
    hair: ['messy-bob-light-blue', 'ponytail-red', 'shaggy-bob-purple', 'lion-mane', 'spiky-brown', 'wavy-blue'],
    face: ['bored', 'focus', 'relieved', 'bored-dark', 'focus-dark', 'relieved-dark',]
};

const locked_assets: Asset = {
    spirit: ['ox', 'peacock', 'loong'],
    clothes: ['black-knight-blue', 'steampunk-armor', 'power-stone'],
    hair: ['slime', 'super-saiyan', 'taichi'],
    face: ['red', 'purple', 'blue'],
}

interface Selected {
    spirit: string;
    clothes: string;
    hair: string;
    face: string;
}

interface UserData {
    username: string;
    state: {
      level: number;
      points: number;
    };
    character: any; // Adjust according to the actual structure
    level_rank: number;
    point_rank: number;
}


function getRandomSelection(): Selected {
    return Object.keys(assets).reduce((acc, key) => {
        const items = assets[key as keyof Asset];
        acc[key as keyof Selected] = items[Math.floor(Math.random() * items.length)];
        return acc;
    }, {} as Selected);
}

export default function Edit() {
    const getPstDateString = () => {
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
    const { address, isConnecting, isDisconnected } = useChecksumAccount()
    const [signature, setSignature] = useState(getStoredSignature);

    const [isMobile, setIsMobile] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [userDataLoaded, setUserDataLoaded] = useState(false);
    const [userData, setUserData] = useState<UserData>();
    const router = useRouter();


    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {  // Specify the event type
        const newValue = event.target.value;
        // Allow only alphanumeric characters
        if (/^[a-z0-9]+$/i.test(newValue) || newValue === "") { // the regex /^[a-z0-9]+$/i checks for alphanumeric characters
            setUsername(newValue.toUpperCase()); // Assuming you still want the input to be uppercase
        }
    };

    const getAndLoadUserData = async () => {
        if (!address || !signature || userDataLoaded) {
            return
        }
        const userData = await getUserData(address, signature)
        //console.log("resultData", userData)

        setUsername(userData.username)
        setSelected(userData.character)
        setUserDataLoaded(true)
    }
    

    useEffect(() => {
        const addressSigned = localStorage.getItem('addressSigned');
        if (!address || !signature || addressSigned != address) {
            router.push("/")
            toast.remove();
            toast.error("Please click ENTER to sign in")
            return
        }
        else {
            // get and load user data
            getAndLoadUserData()
        }
    }, [useChecksumAccount()]);
    

    useEffect(() => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.parentNode?.removeChild(star);
        });
        const imageUrl = window.innerWidth <= 768 ? 'signup-bg-m.png' : 'signup-bg-4.png';
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        document.body.style.backgroundSize = 'cover'; // Cover the entire page
        document.body.style.backgroundRepeat = 'no-repeat'; // Do not repeat the image
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundPosition = 'center center';
        // Handler to set state based on screen width
        function handleResize() {
            setIsMobile(window.innerWidth <= 768); // Assuming 768px as a breakpoint for mobile
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => {
            window.removeEventListener('resize', handleResize);
        };


    }, []);
    const [selected, setSelected] = useState<Selected>({
        spirit: '',
        clothes: '',
        hair: '',
        face: ''
    });

    const handleSelect = (category: keyof Selected, item: string) => {
        setSelected(prev => ({ ...prev, [category]: item }));
    };

    const randomizeSelection = () => {
        const newSelection = Object.keys(assets).reduce((acc, key) => {
            const items = assets[key as keyof Asset];
            acc[key as keyof Selected] = items[Math.floor(Math.random() * items.length)];
            return acc;
        }, {} as Selected);
        setSelected(newSelection);
    };

    const handleEdit = async () => {
        if (!address || !signature){
            router.push("/")
            return;
        }
        if (!username) {
            toast.remove()
            toast.error("Please enter your username")
            return
        }

        try {
            const response = await editAPI(address, username, signature, selected.spirit, selected.clothes, selected.hair, selected.face);
            //console.log('edit successful:', response);
            router.push('/profile')
            toast.success('Edit successful!');
        } catch (error) {
            console.error('Error during Edit:', error);
            let errorMessage = 'Edit failed!'; // Default message
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || 'Edit failed!';
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            //console.log('errorMessage', errorMessage)
            toast.remove()
            toast.error(errorMessage);
            }
        }

    return (

        <div style={{paddingTop:isMobile?"":"0"}}  className="pb-32 md:pb-8 p-4 md:p-8 justify-center text-align:center md:flex md:space-x-2 min-h-screen">
            <div className="md:flex-shrink-0 md:w-1/2 mb-4 md:mb-0 justify-center">
                <div style={{ marginLeft: "auto", marginRight: "auto", aspectRatio: "1 / 1", width: "60%" }} className="relative">
                    <img src={`/sign-up-frame5.png`} alt="frame" style={{ position: 'absolute', zIndex: 4 }} />
                    <div style={{ paddingTop: "8%", marginRight: "auto", marginLeft: "auto", aspectRatio: "1 / 1", width: "90%", height: "90%" }} className="relative">

                        {selected.spirit && <img src={`/spirit/${selected.spirit}.png`} alt="Spirit" style={{ position: 'absolute', zIndex: 4 }} />}
                        {selected.clothes && <img src={`/clothes/${selected.clothes}.png`} alt="Clothes" style={{ position: 'absolute', zIndex: 3 }} />}
                        {selected.hair && <img src={`/hair/${selected.hair}.png`} alt="Hair" style={{ position: 'absolute', zIndex: 2 }} />}
                        {selected.face && <img src={`/face/${selected.face}.png`} alt="face" style={{ position: 'absolute', zIndex: 1 }} />}
                    </div>
                </div>
                <div style={{ marginLeft: "auto", marginRight: "auto", width: "90%" }} className="relative">
                    <Input onChange={handleUsernameChange} value={username} maxLength={12} style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center", textTransform: "uppercase", borderRadius: "3px", marginTop: "20px", fontSize: isMobile ? "2.8rem" : "3rem", fontFamily: "GLY", color: "black" }} placeholder='USERNAME' />
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button onClick={() => {handleEdit()}} style={{ fontFamily: "GLY", cursor: "pointer", marginTop: "20px", borderRadius: "3px", backgroundColor: "#013359", color: "white", fontWeight: "700", fontSize: "20px" }} color='#013359' variant={'default'} size={'lg'}>CONFIRM</Button>
                    <Button onClick={() => { randomizeSelection() }} style={{ fontFamily: "GLY", cursor: "pointer", marginTop: "20px", borderRadius: "3px", backgroundColor: "#013359", color: "white", fontWeight: "700", fontSize: "20px", marginLeft: "20px" }} color='#013359' variant={'default'} size={'lg'}>RANDOMIZE</Button>
                </div>
            </div>
            <div style={{ width: "100%" }}>
                <Tab.Group>
                    <Tab.List className="flex p-1 space-x-1">
                        {Object.keys(assets).map(category => (
                            <Tab style={{ transition: "background-color 0.2s ease, color 0.2s ease", fontFamily: "GLY", textAlign: "center", borderRadius: "3px", textTransform:"uppercase",fontWeight: "300", fontSize: "24px" }} key={category} className={({ selected }) =>
                                `w-full py-2.5 
              ${selected ? 'bg-tfr text-white shadow' : 'text-black hover:bg-tfr hover:text-white'}`
                            }>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels>
                        {Object.keys(assets).map((category, idx) => (
                            <Tab.Panel key={idx} className="mt-1 md:p-3 p-1 rounded-xl shadow">
                                <div style={{ maxHeight: isMobile ? "" : "70vh", scrollbarWidth:"thin", overflowX:"hidden", overflowY:"scroll" }} className="grid md:grid-cols-3 grid-cols-3 md:gap-2 gap-1">
                                    {assets[category].concat(locked_assets[category]).map(item => {
                                        const isLocked = locked_assets[category].includes(item);
                                        return (
                                            <>
                                                <style>
                                                    {`
                                        .hover-style:hover {
                                            border: 3px solid #013359;
                                        `}
                                                </style>

                                                <button
                                                    style={{ position: 'relative', cursor: "pointer", borderRadius: "6px", aspectRatio: "1 / 1", }}
                                                    key={item}
                                                    className={isLocked ? '' : 'hover-style'}
                                                    onClick={() => { isLocked ? (() => { toast.remove(); toast('Unlock in NFTs') })() : handleSelect(category as keyof Selected, item) }}
                                                >

                                                    <img style={{ position: 'absolute', top: "0%", left: "0%", width: "100%", borderRadius: "3px", background: "rgb(255 255 255 / 70%)", opacity: isLocked ? "70%" : "" }} src={`/${category}/${item}.png`} alt={item} className="w-full h-auto" />
                                                    {isLocked && <img style={{ position: 'absolute', left: "5%", bottom: '5%' }} src='lock2.svg'></img>}
                                                </button>

                                            </>)
                                    })}
                                    {/*<p style={{ fontSize: "20px", fontFamily: "DM Sans", fontWeight: "700", color: "#013359", marginLeft: "5px", whiteSpace:"nowrap" }}> More in NFTs... </p>*/}

                                </div>

                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
}
