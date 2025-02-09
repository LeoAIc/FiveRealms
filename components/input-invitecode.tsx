'use client'

import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { getInvited } from "@/app/apis";
import useChecksumAccount from "@/lib/useChecksumAccount";


export default function InputInvite() {
    const router = useRouter()
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

    const [inviteCode, setInviteCode] = useState<string>("");
    const { address, isConnecting, isDisconnected } = useChecksumAccount()
    const [signature, setSignature] = useState(getStoredSignature);

    const handleInviteCodeChange = (event: ChangeEvent<HTMLInputElement>) => {  // Specify the event type
        const newValue = event.target.value;
        // Allow only alphanumeric characters
        if (/^[a-z0-9]+$/i.test(newValue) || newValue === "") { // the regex /^[a-z0-9]+$/i checks for alphanumeric characters
            setInviteCode(newValue.toUpperCase()); // Assuming you still want the input to be uppercase
        }
    };

    async function handleConfirmInvite() {
        if (!address || !signature){
            router.push("/")
            return;
        }

        if(!inviteCode?.length || inviteCode?.length<6){
            toast.remove()
            toast('Please input a 6-character invite code')
        }

        try {
            const response = await getInvited(address, signature, inviteCode.toUpperCase());
            //console.log('invite successful:', response);
            router.push('/signup')
            toast.success('invite successful!');
        } catch (error) {
            console.error('Error during invite:', error);
            let errorMessage = 'invite failed!'; // Default message
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || 'invite failed!';
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            //console.log('errorMessage', errorMessage)
            toast.remove()
            toast.error(errorMessage);
            }

    }

    useEffect(() => {
        const addressSigned = localStorage.getItem('addressSigned');
        if(!address || !signature || addressSigned != address){
          router.push("/")
          toast.remove();
          toast.error("Please click ENTER to sign in")
          return
        } 
    }, [useChecksumAccount()]);

    useEffect(() => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.parentNode?.removeChild(star);
        });
        document.body.style.backgroundImage = `url('bg-plain.png')`;
        document.body.style.backgroundSize = 'cover'; // Cover the entire page
        document.body.style.backgroundRepeat = 'no-repeat'; // Do not repeat the image
        document.body.style.overflow = 'hidden';
    
        
      }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p style={{ marginTop:"-16rem",fontFamily: "GLY", fontSize: "38px", textTransform:"uppercase" }}>Enter Invite Code</p>
            <p style={{ fontFamily: "DM Sans", fontSize: "18px", fontWeight:"500" }}>Don't have an Invite Code?</p>
            <p style={{ fontFamily: "DM Sans", fontSize: "18px", fontWeight:"500" }}>Ask a friend or <a style={{cursor:"pointer",textDecorationLine:"underline"}} href="https://twitter.com/thefiverealms" target="_blank" rel="noreferrer">follow us</a>!</p>
            
            <Input
                onChange={handleInviteCodeChange}
                value={inviteCode}
                maxLength={6}
                style={{
                    borderColor: "#013359",
                    borderWidth: "2px",
                    textAlign: "center",
                    textTransform: "uppercase",
                    borderRadius: "3px",
                    marginTop: "60px",
                    fontSize: "3rem",
                    fontFamily: "GLY",
                    color: "black",
                    width: "300px"
                }}
                placeholder='INVITE CODE'
            />
            <Button
                onClick={() => { handleConfirmInvite() }}
                style={{
                    fontFamily: "GLY",
                    cursor: "pointer",
                    marginTop: "20px",
                    borderRadius: "3px",
                    backgroundColor: "#013359",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "20px"
                }}
                color='#013359'
                variant='default'
                size='lg'>
                CONFIRM
            </Button>
        </div>

    )

}
