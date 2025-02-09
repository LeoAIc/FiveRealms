'use client'
import React, { useEffect, useRef, useState } from 'react';
import CopyTooltip from './copy-tooltip';
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation';
import { getUserData } from '@/app/apis';
import CharacterDisplay from './character-display';
import Modal from 'react-modal';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as Tooltip from '@radix-ui/react-tooltip';
import useChecksumAccount from '@/lib/useChecksumAccount';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

//Modal.setAppElement('#__next');


interface UserData {
  username: string;
  state: {
    level: number;
    points: number;
  };
  character: any; // Adjust according to the actual structure
  level_rank: number;
  point_rank: number;
  points_history: any;
}

interface ImageMap {
  [key: string]: HTMLImageElement;
}

export default function Profile() {
  const [isMobile, setIsMobile] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [userData, setUserData] = useState<UserData>();
  const [modalIsOpen, setModalIsOpen] = useState(false);
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

  const getAndLoadUserData = async () => {
    if (!address || !signature || userDataLoaded) {
      return
    }
    const userData = await getUserData(address, signature)
    //console.log("resultData", userData)

    setUserData(userData)
    setUserDataLoaded(true)
  }

  const getStoredSignature = () => {
    const storedSignature = localStorage.getItem('signature');
    const dateSigned = localStorage.getItem('dateSigned');
    const currentDate = getPstDateString();

    return dateSigned === currentDate ? storedSignature : '';
  };
  const { address, isConnecting, isDisconnected } = useChecksumAccount()
  const [signature, setSignature] = useState(getStoredSignature);

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

  const headerRef = useRef<HTMLHeadingElement>(null);
  // Effect for setting and updating the body background
  useEffect(() => {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.parentNode?.removeChild(star);
    });
    const imageUrl = window.innerWidth <= 768 ? 'profile-bg-m2.png' : 'profile-bg-ent.png';
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



  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImages = (sources: { [key: string]: string | null }, callback: (images: ImageMap) => void): void => {
    let images: ImageMap = {};
    let loadedImages = 0;
    let numImages = Object.keys(sources).filter(key => sources[key] !== null).length;

    Object.keys(sources).forEach(key => {
      if (sources[key]) {
        const img = new Image();
        img.onload = () => {
          if (++loadedImages >= numImages) {
            callback(images);
          }
        };
        img.src = sources[key]!;
        images[key] = img;
      }
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText("https://play.fiverealms.ai/player/" + userData?.username);
    toast.remove();
    toast.success("Link Copied!")
  };

  const handleDownload = (): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const character = userData?.character;
      if (!character) return;

      const sources = {
        face: character.face ? `/face/${character.face}.png` : null,
        hair: character.hair ? `/hair/${character.hair}.png` : null,
        clothes: character.clothes ? `/clothes/${character.clothes}.png` : null,
        spirit: character.spirit ? `/spirit/${character.spirit}.png` : null,
      };

      loadImages(sources, (images) => {
        canvas.width = 2048; // Customize to your requirement
        canvas.height = 2048; // Customize to your requirement

        ctx.fillStyle = '#dedede'; // Change to desired background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scaleWidth = canvas.width * 0.86;
        const scaleHeight = canvas.height * 0.86;
        const offsetX = (canvas.width - scaleWidth) / 2;
        const offsetY = canvas.height - scaleHeight;

        Object.keys(images).forEach(key => {
          if (images[key]) {
            ctx.drawImage(images[key], offsetX, offsetY, scaleWidth, scaleHeight);
          }
        });

        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'character.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast("Download successful")
      });
    }
  };

  const handleHistory = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const formatTime = (timeString: string) => {
    return dayjs.tz(timeString, 'America/Los_Angeles').fromNow();
  };

  const formatTime2 = (timeString: string) => {
    const now = dayjs();
    const time = dayjs.tz(timeString, 'America/Los_Angeles');
    const diffInSeconds = now.diff(time, 'second');
    const diffInMinutes = now.diff(time, 'minute');
    const diffInHours = now.diff(time, 'hour');
    const diffInDays = now.diff(time, 'day');
    const diffInMonths = now.diff(time, 'month');

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    } else {
      return `${diffInMonths}mo ago`;
    }
  };

  const formatHoverTime = (timeString: string) => {
    return dayjs.tz(timeString, 'America/Los_Angeles').tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss');
  };


  return (
    <div style={{ height: "100%" }}>
      <div
        onClick={() => { router.push('/edit') }}
        style={{
          borderWidth: "2px",
          borderRadius: "3px",
          borderColor: "#013359",
          padding: "5px",
          backgroundColor: "#FFF",
          position: "absolute",
          right: "1rem",
          top: "5rem",
          cursor: "pointer",
          opacity: "90%",
        }}>
        <img src="/edit.svg" alt='Edit' style={{ width: isMobile ? "20px" : "30px", height: isMobile ? "20px" : "30px" }}></img>
      </div>
      <div
        onClick={handleShare}
        style={{
          borderWidth: "2px",
          borderRadius: "3px",
          borderColor: "#013359",
          padding: "7px",
          backgroundColor: "#FFF",
          position: "absolute",
          right: "1rem",
          top: isMobile ? "118px" : "130px",
          width: isMobile ? "34px" : "44px", height: isMobile ? "34px" : "44px",
          cursor: "pointer",
          opacity: "90%",
        }}>
        <img src="/share2.svg" alt='share' style={{ width: "100%", height: "100%" }}></img>

      </div>
      <div
        onClick={() => { handleDownload() }}
        style={{
          borderWidth: "2px",
          borderRadius: "3px",
          borderColor: "#013359",
          padding: "5px",
          backgroundColor: "#FFF",
          position: "absolute",
          right: "1rem",
          top: isMobile ? "156px" : "180px",
          cursor: "pointer",
          opacity: "90%",

        }}>
        <img src="/download.svg" alt='download' style={{ width: isMobile ? "20px" : "30px", height: isMobile ? "20px" : "30px" }}></img>
      </div>
      <div
        onClick={() => { handleHistory() }}
        style={{
          borderWidth: "2px",
          borderRadius: "3px",
          borderColor: "#013359",
          padding: "5px",
          backgroundColor: "#FFF",
          position: "absolute",
          right: "1rem",
          top: isMobile ? "194px" : "230px",
          cursor: "pointer",
          opacity: "90%",

        }}>
        <img src="/history.svg" alt='history' style={{ width: isMobile ? "20px" : "30px", height: isMobile ? "20px" : "30px" }}></img>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div style={{ height: isMobile ? "70%" : "60%" }} className={` mt-8 ${isMobile ? 'mx-4' : 'mx-20'} flex items-end`}>

        {userData &&
          <div className="flex flex-col md:flex-row justify-between items-center" style={{ width: "100%" }}>
            <div>
              <p ref={headerRef} className="font-black" style={{ fontFamily: 'GLY', color: "#013359", fontSize: isMobile ? "46px" : "6vw", lineHeight: "1", marginLeft: "10px" }}>
                {userData.username.toUpperCase()}
              </p>

              <CopyTooltip isMobile={isMobile} address={address ? address : ""}></CopyTooltip>
              <div className='mt-8 md:block flex mx-auto' style={{ marginBottom: isMobile ? "3vh" : "0", alignItems: 'center' }}>
                <p className="text-black text-lg" style={{ fontFamily: 'GLY', color: "#013359", marginRight: '10px', display: isMobile ? "block" : 'flex', alignItems: 'center', fontSize: isMobile ? "20px" : "2rem" }}>
                  <img src={'/fist-red.svg'} style={{ marginRight: "5px", width: "40px", display: 'inline-block', verticalAlign: 'middle' }} alt="" />
                  Lv. {userData.state.level} <p className="text-gray-800 md:ml-4 ml-1"> Rank {userData.level_rank?("#"+userData.level_rank.toLocaleString()):"?"}</p>
                </p>
                <p className="md:mt-4 md:ml-0 ml-4 text-black text-lg" style={{ fontFamily: 'GLY', color: "#013359", display: isMobile ? "block" : 'flex', alignItems: 'center', fontSize: isMobile ? "20px" : "2rem" }}>
                  <img src={'/flamer-red.svg'} style={{ marginRight: "5px", width: "40px", display: 'inline-block', verticalAlign: 'middle' }} alt="" />
                  {(userData.state.points).toLocaleString()} <p className="text-gray-800 md:ml-4 ml-1">Rank {userData.point_rank?("#"+userData.point_rank.toLocaleString()):"?"}</p>
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
      
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            contentLabel="Points History"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: "100",
              },
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? '100%' : '60%',
                height: isMobile ? '100%' : '80%',
                padding: isMobile ? "20px" : '40px',
                scrollbarWidth: "thin",
                borderRadius: isMobile ? "3px" : '8px',
              },
            }}
          >
            <p style={{ marginTop: "-10px", fontFamily: "GLY", fontSize: "24px", textTransform: "uppercase" }}>Points History
              <button onClick={closeModal} style={{ display: "inline-block", fontFamily: "GLY", fontSize: "24px", color: "#013359", float: 'right', margin: '0', cursor: 'pointer' }}>CLOSE</button>

            </p>
            <div style={{ marginTop: "40px" }}></div>
            <div style={{ paddingLeft: "0px", paddingRight: "0px" }}>
              {userData?.points_history && userData?.points_history.length > 0 ? (
                <ul>
                  {userData.points_history.slice().reverse().map((entry: { points: number, reason: string, time: any; }, index: React.Key | null | undefined) => {
                    if (!entry) { return }
                    return (
                      <li key={index} style={{ display: 'flex', justifyContent: 'space-between',paddingLeft:isMobile?"0px":"10px", paddingRight:isMobile?"0px":"10px", paddingBottom: '10px', paddingTop: '10px', borderBottom: index !== userData.points_history.length - 1 ? '1px solid #ccc' : 'none' }}>
                        <span
                          style={{
                            marginTop:"-3px",
                            fontSize: isMobile?"16px":"20px",
                            fontFamily: "GLY",
                            marginRight: "auto",
                            whiteSpace: "nowrap",
                            color: "#013359"
                          }}
                        >
                          +{entry.points} <img src={'/flamer-red.svg'} style={{ marginLeft: "-5px", width: isMobile?"18px":"20px", marginTop: "0px", display: 'inline-block', verticalAlign: 'middle' }} alt="" />
                        </span>
                        <span style={{ fontSize: isMobile?"12px":"16px", fontFamily: "DM Sans", fontWeight: isMobile?"500":"700", textTransform: "capitalize" }}>
                          {entry.reason}
                            <span title={formatHoverTime(entry.time)} style={{ fontFamily: "DM Sans", fontWeight: "300", marginLeft: isMobile?"5px":"15px", cursor: 'pointer',textTransform:"lowercase" }}>
                              {formatTime2(entry.time)}
                            </span>
                        </span>
                      </li>)
                  })}
                </ul>
              ) : (
                <div></div>
              )}

            </div>
          </Modal>
    </div>
  );
}
