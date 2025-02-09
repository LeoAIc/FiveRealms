import { useState, useEffect } from 'react';
import "./music-widget.css";

export function MusicWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /*useEffect(() => {

    
    if(window && window.innerWidth > 768){
      setTimeout(() => {
        handleCDClick();
      }, 2000);
    }
  }, [window]);*/

  const handleCDClick = () => {
    console.log("click")
    const audio = document.getElementById('music') as HTMLAudioElement;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    function handleResize() {
        setIsMobile(window.innerWidth <= 768); // Mobile breakpoint at 768px
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Check at component mount

    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);

  return (
    <div>
      <div
        id="cd"
        style={{zIndex:"5", position:"absolute", bottom:isMobile?"220px":"20px", right:isMobile?"10px":"20px", width:isMobile?"40px":"60px", height:isMobile?"40px":"60px"}}
        className={`cd ${isPlaying ? 'rotating' : ''}`}
        onClick={handleCDClick}
      ></div>
      <div
        style={{zIndex:"5", position:"absolute", bottom:isMobile?"210px":"5px", right:isMobile?"0px":"4px", width:isMobile?"40px":"60px", height:isMobile?"40px":"60px"}}
        
        onClick={handleCDClick}
      ><img style={{width:isMobile?"20px":"30px", cursor:"pointer"}} src={isPlaying?"/musicpause.svg":"/musicplay.svg"}></img></div>

      <audio id="music" src="/music.mp3" loop></audio>
    </div>
  );
}
