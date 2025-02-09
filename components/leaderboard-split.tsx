// pages/index.tsx
'use client'
import { useEffect, useState } from 'react';
import Leaderboard from './leaderboard';
import Invitations from './invitations';


export default function LeaderBoardSplit() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.parentNode?.removeChild(star);
        });
        document.body.style.backgroundImage = `url('f0f0f0.png')`;
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

    if(isMobile){
        return (
            <Leaderboard />
        )
    }

    return (
        <>
        <div className="md:w-1/2">
            <Leaderboard />
        </div>
        <div className="md:w-1/2 mb-4 md:mb-0">
            <Invitations />
        </div>
        </>
    );
}
