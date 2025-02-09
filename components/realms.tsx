// pages/index.tsx
'use client'
import { useEffect, useState } from 'react';

import './stars.css'

export default function Realms() {
    const [isMobile, setIsMobile] = useState(false);
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        createStars(250); // Create 100 stars
        document.body.style.backgroundImage = `url('/black.png')`;
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundPosition = 'center center';

        function handleResize() {
            setIsMobile(window.innerWidth <= 768); // Mobile breakpoint at 768px
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Check at component mount

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    function createStars(numberOfStars: number) {
        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            const w = Math.random()*3;
            star.className = 'star';
            star.style.position = `absolute`;
            star.style.width=w+'px';
            star.style.height=w+'px';
            star.style.zIndex='0';
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.backgroundColor='white';
            star.style.borderRadius= '50%';
            star.style.boxShadow= '0 0 5px #fff, 0 0 10px #fff';
            star.style.animation = `twinkle ${Math.random() * 10 + 1}s linear infinite`;
            document.body.appendChild(star);
        }
    }

    return (
        <>
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
            <img 
                src="/maponly.png" 
                style={{ 
                    position: 'absolute', 
                    top:isMobile?"20%":0,
                    maxWidth: isMobile?"138vw":'100vw',
                    maxHeight: '90vh',
                    zIndex:"2",
                    animation: 'zoomIn 3s forwards' 
                }} 
            />
                <img 
                    src="/annotations2.png" 
                    style={{ 
                        position: 'absolute', 
                        top:isMobile?"20%":0,
                        maxWidth: isMobile?"138vw":'100vw',
                        maxHeight: '90vh',
                        zIndex:"3",
                        display:toggle?"":"none",
                        animation: 'fadeIn 1s forwards'
                    }} 
                />
            
            <div style={{ zIndex:"4",position: 'absolute', top: isMobile?"1%":"85%", left: 55 }}>
                <label className="switch">
                    <input type="checkbox" checked={toggle} onChange={() => setToggle(!toggle)} />
                    <span className="slider"></span>
                </label>
                
            </div>
            <img style={{ position: 'absolute', top: isMobile?"0.5%":"84.5%", left: 20, height:"30px" }} src='/pin2.png' ></img>
            <style jsx>{`
                
                @keyframes zoomIn {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 34px;
                    height: 20px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 5px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 12px;
                    width: 12px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 3px;
                }

                input:checked + .slider {
                    background-color: #013359;
                }

                input:checked + .slider:before {
                    transform: translateX(14px);
                }
            `}</style>
        </div>
        </>
    );
}
