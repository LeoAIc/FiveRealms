'use client'


import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'

import { signIn, signUp, getUserData } from '@/app/apis'
import useChecksumAccount from '@/lib/useChecksumAccount';
import { ConnectModal, useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';

// Remove duplicate import as it's already imported above
// import { useWallets } from './path/to/useWallets';

function useSignature({ message }: { message: string }) {
    const [data, setSignData] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { mutate: signPersonalMessage } = useSignPersonalMessage();
	const currentAccount = useCurrentAccount();

    const { address, publicKey } = useChecksumAccount();
    

    const signMessage = useCallback(async () => {
        setIsLoading(true);
        try {
            signPersonalMessage(
                {
                    message: new TextEncoder().encode(message),
                },
                {
                    onSuccess: (result) => {console.log(message, publicKey, result);setSignData(result.signature);setIsSuccess(true); setIsError(false);},
                },);
        } catch (error) {
            console.error("Signing error:", error);
            setIsError(true);
            setSignData(null);
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    }, [message, address]);

    return { data, isError, isSuccess, isLoading, signMessage };
}

export function Landing() {
    //const {isOpen, setOpen} = useModal();
    const [isOpen, setOpen] = useState(false);
    const currentAccount = useCurrentAccount();

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

    const router = useRouter()
    const { address, isConnecting, isDisconnected } = useChecksumAccount()

    

    const { data:signData, isError:signIsError, isSuccess: signIsSuccess, isLoading: signIsLoading, signMessage } = useSignature({
        message: 'Sign in to The Five Realms '+ getPstDateString(),
      })
      const [signing, setSigning] = useState(false)
      const [signature, setSignature] = useState(getStoredSignature);

    useEffect(() => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.parentNode?.removeChild(star);
        });
        const imageUrl = window.innerWidth <= 768 ? 'landing-m.png' : 'landingnew1.png';
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        document.body.style.backgroundSize = 'cover'; // Cover the entire page
        document.body.style.backgroundRepeat = 'no-repeat'; // Do not repeat the image
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundPosition = window.innerWidth <= 768 ? 'top, center center': 'center center';
    }, []);

    useEffect(() => {
        const saveDataAndFetchUser = async () => {
            if (signIsSuccess) {
                setSigning(false);
                console.log(address, signData)
                if (signData && address) {
                    setSignature(signData);
                    // Save signature and current getPstDateString to localstorage
                    const currentDate = getPstDateString();
                    localStorage.setItem('signature', signData);
                    localStorage.setItem('dateSigned', currentDate);
                    localStorage.setItem('addressSigned', address);
                    
                    if(address && signData){
                        const userData = await getUserData(address, signData);
                        //console.log(userData)
                        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
                        if(!userData){
                            if (currentHost == "fiverealms.ai"){
                                router.push("/invite")
                            }
                            else{
                                router.push("/signup")
                            }
                            return
                        }
                        else{
                            router.push("/play")
                            return
                        }
                    }
                }
                else{
                    toast.remove();
                    toast.error("Error, Please Try Again")
                }
            }
        };

        saveDataAndFetchUser();
    }, [signIsSuccess]);

    useEffect(() => {
        if(signIsError){
          setSigning(false)
          toast.remove();
          toast.error("Please Sign The Message To Play")
        } 
      }, [signIsError]);

    const signInOrSignUp = async ()=>{
        if(address && signature){
            const addressSigned = localStorage.getItem('addressSigned');
            if (addressSigned == address){
                const userData = await getUserData(address, signature);
                //console.log(userData)
                const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
                if(!userData){
                    if (currentHost == "fiverealms.ai"){
                        router.push("/invite")
                    }
                    else{
                        router.push("/signup")
                    }
                    return
                }
                else{
                    router.push("/play")
                    return
                }
            } 
        }

        if (address && !signing){
            signMessage()
            setSigning(true);
        }
        else{
            setOpen(true)
        }
    }

    return (
        <>
        <div style={{
            height:'100%',
            minHeight: '100vh', // Minimum height of the viewport
            display: 'flex',
            flexDirection: 'column', // Stack children vertically
            justifyContent: 'center', // Center horizontally in the flex container
            alignItems: 'start', // Center vertically in the flex container
            
        }} className='pl-0 md:pl-5p'>
            
            {/*<p onClick={signInOrSignUp} className="text-3xl md:text-4xl" style={{fontWeight:"700", cursor:"pointer", marginTop:"20px", fontStyle:"italic"}}>Enter</p>*/}
            <style>{`
                .landing-button {
                    color: #013359;
                    border-top: 5px solid #013359;
                    border-bottom: 5px solid #013359;
                   
                    transition: background-color 0.2s ease, color 0.2s ease;
                    font-family: "GLY";
                    cursor: pointer;
                    font-weight: 700;
                    width:300px;
                    text-align: center;
                    border-radius: 1px;
                    font-size: 40px;
                    line-height: 50px;
                    margin-top: 20vh;
                }

                .landing-button:hover {
                    color: white;
                    background-color: #013359;
                }
                @media (max-width: 768px) {
                    .landing-button {
                        font-size: 36px;
                        line-height: 40px;
                        position: absolute;
                        bottom: 20%;
                        left: 0;
                        right: 0;
                        margin-top: 0;
                    }
                }
                @media (max-height: 650px) {
                    .landing-button {
                        font-size: 36px;
                        line-height: 40px;
                        position: absolute;
                        bottom: 5%;
                        left: 0;
                        right: 0;
                        margin-top: 0;
                    }
                }
                `}
            </style>
            <div onClick={signInOrSignUp} className="landing-button text-3xl mx-auto md:mx-0">
                <p>ENTER</p>
            </div>
            <ConnectModal
                trigger={
                    <button disabled={!!currentAccount}> {currentAccount ? '' : ''}</button>
                }
                open={isOpen}
                onOpenChange={(isOpen) => setOpen(isOpen)}
            />

            {/*<Button onClick={signInOrSignUp} style={{fontFamily:"GOW", fontSize:"30px",cursor:"pointer",marginTop:"20px", borderRadius:"3px", backgroundColor:"#013359", color:"white", fontWeight:"700"}} color='#013359' variant={'default'} size={'lg'}>ENTER</Button>*/}
            
            
        </div></>
    );


}
