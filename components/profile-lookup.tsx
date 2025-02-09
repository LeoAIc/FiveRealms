'use client'
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import CopyTooltip from './copy-tooltip';
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation';
import { getUserData, getUserProfile } from '@/app/apis';
import CharacterDisplay from './character-display';

interface UserData {
  address: string;
  username: string;
  state: {
    level: number;
    points: number;
  };
  character: any; // Adjust according to the actual structure
  level_rank: number;
  point_rank: number;
}

export default function ProfileLookUp({ username }: {username:string}) {
  const [isMobile, setIsMobile] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [userData, setUserData] = useState<UserData>();
  const router = useRouter()
  
  const getAndLoadUserData = async () => {

    const userData = await getUserProfile(username)
    //console.log("resultData", userData)

    setUserData(userData)
    setUserDataLoaded(true)
  }

 
  useEffect(() => {
      // get and load user data
      getAndLoadUserData()
    
  }, [username]);

  const headerRef = useRef<HTMLHeadingElement>(null);
  // Effect for setting and updating the body background
  useEffect(() => {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.parentNode?.removeChild(star);
    });
    const imageUrl = window.innerWidth <= 768 ? '/profile-bg-m2.png' : '/profile-bg-ent.png';
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundPosition = 'top right, center center';

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

  return (
    <div style={{ height: "100%" }}>
      <div style={{ height: isMobile ? "70%" : "60%" }} className={` mt-8 ${isMobile ? 'mx-4' : 'mx-20'} flex items-end`}>

        {userData && <div className="flex flex-col md:flex-row justify-between items-center" style={{ width: "100%" }}>
          <div>
            <p ref={headerRef} className="font-black" style={{ fontFamily: 'GLY', color: "#013359", fontSize: isMobile ? "46px" : "6vw", lineHeight: "1" }}>
              {userData.username.toUpperCase()}
            </p>
            <CopyTooltip isMobile={isMobile} address={userData.address}></CopyTooltip>
            <div className='mt-8 md:block flex mx-auto' style={{ marginBottom: isMobile ? "3vh" : "0", alignItems: 'center' }}>
              <p className="text-black text-lg" style={{ fontFamily: 'GLY', color: "#013359", marginRight: '10px', display: isMobile ? "block" : 'flex', alignItems: 'center', fontSize: isMobile ? "20px" : "2rem" }}>
                <img src={'/fist-red.svg'} style={{ marginRight: "5px", width: "40px", display: 'inline-block', verticalAlign: 'middle' }} alt="" />
                Lv. {userData.state.level} <p className="text-gray-800 md:ml-4 ml-1"> Rank #{userData.level_rank.toLocaleString()}</p>
              </p>
              <p className="md:mt-4 md:ml-0 ml-4 text-black text-lg" style={{ fontFamily: 'GLY', color: "#013359", display: isMobile ? "block" : 'flex', alignItems: 'center', fontSize: isMobile ? "20px" : "2rem" }}>
                <img src={'/flamer-red.svg'} style={{ marginRight: "5px", width: "40px", display: 'inline-block', verticalAlign: 'middle' }} alt="" />
                {(userData.state.points).toLocaleString()} <p className="text-gray-800 md:ml-4 ml-1">Rank #{userData.point_rank.toLocaleString()}</p>
              </p>
            </div>
          </div>
          <div className="flex items-end" style={{ marginRight: isMobile ? "0" : "20%" }}>
            <div style={isMobile ? { width: '60vw', height: '60vw', minWidth: "250px", minHeight: "250px" } : { width: '30vw', height: '30vw', minWidth: "300px", minHeight: "300px" }}>
              {/*<img src="/char.png" alt="Character Image" style={{ width: "100%", height: "100%" }} />*/}
              <CharacterDisplay username={userData.username} character={userData.character} styles={{ width: "100%", height: "100%" }}></CharacterDisplay>
            </div>
          </div>
        </div>}
      </div>
      <div style={{ height: isMobile ? "30%" : "40%", borderRadius: "0px", backgroundColor: "#013359", paddingBottom: "50px" }} className={`text-black p-3`}>
        {/* Map through your collection here */}
        <div className={`${isMobile ? 'mx-2' : 'mx-20'}`}>
          <div className='text-white font-black text-4xl mb-2' style={{ fontFamily: 'GOW' }}>Collection</div>
          <div style={{ height: "80%" }} className='flex space-x-2 overflow-x-auto'>
            {/*<div style={{aspectRatio:"1/1", borderRadius:"3px"}} className="flex-shrink-0 bg-white flex items-center justify-center">Item 1</div>
            <div style={{aspectRatio:"1/1", borderRadius:"3px"}} className="flex-shrink-0 bg-white flex items-center justify-center">Item 2</div>
    <div style={{aspectRatio:"1/1", borderRadius:"3px"}} className="flex-shrink-0 bg-white flex items-center justify-center">Item 3</div>*/}
            <p className='text-white font-black text-xl' style={{ fontFamily: 'DM Sans' }}>Items and NFTs Coming Soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
