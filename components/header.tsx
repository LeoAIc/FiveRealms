'use client'
import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconTwitter,
  IconNextChat,
  IconSeparator,
  IconVercel,
  IconTwitterBlack
} from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'

import { ChatHistory } from './chat-history'
import MobileMenu from './mobilemenu'
import DesktopMenu from './desktopmenu'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserData } from '@/app/apis'

import { ConnectButton, useAutoConnectWallet } from '@mysten/dapp-kit';
import useChecksumAccount from '@/lib/useChecksumAccount'

export function Header() {
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
  const autoConnectionStatus = useAutoConnectWallet();
  const getStoredSignature = () => {
    const storedSignature = localStorage.getItem('signature');
    const dateSigned = localStorage.getItem('dateSigned');
    const currentDate = getPstDateString();

    return dateSigned === currentDate ? storedSignature : '';
  };
  const { address, isConnecting, isDisconnected } = useChecksumAccount()
  const [signature, setSignature] = useState(getStoredSignature);
  const [userSignedUp, setUserSignedUp] = useState(false);

  const getAndLoadUserData = async () => {
    if (!address || !signature || userSignedUp) {
      return
    }
    const userData = await getUserData(address, signature)
    //console.log("resultData", userData)

    if (userData && userData.username) {
      setUserSignedUp(true)
    }

  }

  useEffect(() => {
    const addressSigned = localStorage.getItem('addressSigned');
    if (!address || !signature || addressSigned != address) {
      setUserSignedUp(false)
      return
    }
    else {
      getAndLoadUserData()
    }
  }, [useChecksumAccount()]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-20 px-4">
      <div className="flex items-center">
        <a style={{ cursor: "pointer" }} onClick={() => { if(userSignedUp) router.push("/play") }}><img width={"55px"} style={{ borderRadius: "4px" }} src='/logoblue.png'></img></a>
      </div>
      <div className="flex items-center justify-end space-x-2">
        {address && userSignedUp && <a
          onClick={() => { router.push("/play") }}
          className="hidden md:block hover:bg-tfr hover:text-white text-black font-bold py-0 px-3"
          rel="noopener noreferrer"
          style={{ cursor: "pointer", fontFamily: "DM Sans", fontSize: "20px", marginRight: "5px", fontWeight: 700, borderRadius: "3px", transition: "background-color 0.2s ease, color 0.2s ease" }}
        >
          Play
        </a>}

        {address && userSignedUp && <a
          onClick={() => { router.push("/profile") }}
          className="hidden md:block hover:bg-tfr hover:text-white text-black font-bold py-0 px-3"
          rel="noopener noreferrer"
          style={{ cursor: "pointer", fontFamily: "DM Sans", fontSize: "20px", marginRight: "5px", fontWeight: 700, borderRadius: "3px", transition: "background-color 0.2s ease, color 0.2s ease" }}
        >
          Profile
        </a>}



        <ConnectButton/>
        <div className="hidden md:block"><DesktopMenu userSignedUp={userSignedUp} address={address} /></div>
        <div className="block md:hidden" style={{ marginLeft: "5px" }}></div>
        <div className="block md:hidden">
          <MobileMenu userSignedUp={userSignedUp} address={address} />
        </div>
      </div>
    </header>
  )
}
