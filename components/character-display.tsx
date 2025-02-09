


import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";

interface CharacterDisplayProps {
    character: {
        spirit: string;
        clothes: string;
        hair: string;
        face: string;
    };
    username: string;
    input?: string;
    styles?: React.CSSProperties; 
    isLoading?:boolean;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, username,input, styles,isLoading }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [displayInput, setDisplayInput] = useState(input);

    useEffect(() => {
        // Update displayInput whenever input changes and is not empty
        if (input !== "") {
        setDisplayInput(input);
        }

        // Clear displayInput after 5 seconds when input becomes empty
        if ((!input || input === "") ) {
            if((displayInput && displayInput?.length>2)){
                const timer = setTimeout(() => {
                    setDisplayInput("");
                }, 5000);
                
                // Clear the timeout if input changes again before 5 seconds
                return () => clearTimeout(timer);
            }
            else{
                setDisplayInput("");
            }
        
        }
    }, [input]);
    ////console.log(character)
    if (!character){
        return null
    }
    return (
        <>
        {displayInput && (
      <>
    <style>
      {`
      .bubble::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 15px solid transparent;
        border-top-color: rgba(255, 255, 255);
        border-bottom: 0;
        margin-left: -15px;
        margin-bottom: -15px;
      }
    
      .bubble::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 17px solid transparent;
        border-top-color: rgba(255, 255, 255);
        border-bottom: 0;
        margin-left: -17px;
        margin-bottom: -17px;
      }
      `}
    </style>

    <div style={{
        position: "absolute",
        bottom: "11rem",
        left:"0%",
        padding: "8px",
        fontSize:"12px",
        background: "rgba(255, 255, 255)", // Semi-transparent white background
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow for better visibility
        maxWidth: "140px", // Prevents the bubble from being too wide
        minWidth:"140px",
        margin:"8px",
        opacity:"80%",
        textAlign:displayInput.length<15?"center":'center',
        zIndex: 100 // Ensures it's above most other elements,

      }} className="text-bubble bubble">
          <p style={{
              fontFamily: "DM Sans",
              fontWeight: "700",
              backgroundColor: 'transparent',
              color: "black",
              wordWrap:"break-word"
          }}>{displayInput}</p>
      </div></>
)}
        <div onClick={()=>setIsOpen(true)} className="relative cursor-pointer" style={styles}>
            {character.spirit && <img src={`/spirit/${character.spirit}.png`} alt="Spirit" style={{ position: 'absolute', zIndex: 5 }} />}
            {character.clothes && <img src={`/clothes/${character.clothes}.png`} alt="Clothes" style={{ position: 'absolute', zIndex: 4 }} />}
            {character.hair && <img src={`/hair/${character.hair}.png`} alt="Hair" style={{ position: 'absolute', zIndex: 3 }} />}
            {character.face && <img src={`/face/${character.face}.png`} alt="Face" style={{ position: 'absolute', zIndex: 2 }} />}
        </div>
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={()=>{setIsOpen(false)}}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column", 
                            position: "fixed",
                            zIndex: 1,
                            left: 0,
                            top: 0,
                            width: "100%",
                            height: "100%",
                            overflow: "auto"
                        }}
                    >
                        <div className="relative" style={{ maxWidth:"50vh",height:"50vh", width:"50vh"}}>
                            {character.spirit && <img src={`/spirit/${character.spirit}.png`} alt="Spirit" style={{ position: 'absolute', zIndex: 4 }} />}
                            {character.clothes && <img src={`/clothes/${character.clothes}.png`} alt="Clothes" style={{ position: 'absolute', zIndex: 3 }} />}
                            {character.hair && <img src={`/hair/${character.hair}.png`} alt="Hair" style={{ position: 'absolute', zIndex: 2 }} />}
                            {character.face && <img src={`/face/${character.face}.png`} alt="Face" style={{ position: 'absolute', zIndex: 1 }} />}
                        </div>   
                        
                        <p className="font-black" style={{ display:"block",fontFamily: 'GLY', color: "#FFFFFF",marginTop:"20px", fontSize: "60px", lineHeight: "1", marginLeft:"10px" }}>
                        {username.toUpperCase()}
                        </p>
                        
                    </motion.div>
                </motion.div>
            ): null}
        </AnimatePresence>
        </>
    );
};

export default CharacterDisplay;
