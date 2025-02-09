'use client'
import { getLevelLeaderboard, getPointsLeaderboard } from '@/app/apis';
import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import CharacterDisplay from './character-display';

interface Character {
    spirit: string;
    clothes: string;
    hair: string;
    face: string;
  }

interface LevelEntry {
    rank: number;
    username: string;
    address: string;
    level: number;
    character: Character;
}

interface PointsEntry {
    rank: number;
    username: string;
    address: string;
    points: number;
    character: Character;
}

type LeaderboardEntry = LevelEntry | PointsEntry;
type LeaderboardType = 'level' | 'points';

const SpringModal = ({
    imageUrl,
    isOpen,
    onClose,
}: {
    imageUrl: string;
    isOpen: boolean;
    onClose: any;
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onClose()}
                    className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={()=>{onClose()}}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "fixed",
                            zIndex: 1,
                            left: 0,
                            top: 0,
                            width: "100%",
                            height: "100%",
                            overflow: "auto"
                        }}
                    >
                        
                        <img src={imageUrl} style={{ maxWidth:"50vh",height:"50vh", width:"50vh"}} alt="Full Size" />
                           
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const Leaderboard = () => {
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
    const [currentTab, setCurrentTab] = useState<LeaderboardType>('level');
    const [isLoading, setIsLoading] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<{ level: LeaderboardEntry[], points: LeaderboardEntry[] }>({ level: [], points: [] });

    useEffect(() => {
        fetchAllLeaderboards();
    }, []);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const scrollContainer = event.currentTarget;
        const theadElement = scrollContainer.querySelector("thead") as HTMLTableSectionElement;
        theadElement.style.backgroundColor = scrollContainer.scrollTop > 0 ? '#013359' : 'transparent';
        theadElement.style.color = scrollContainer.scrollTop > 0 ? '#FFFFFF' : '#013359';
        theadElement.style.borderTop = scrollContainer.scrollTop > 0 ? "none" : "3px solid #013359";
        theadElement.style.borderBottom = scrollContainer.scrollTop > 0 ? "none" : "3px solid #013359";
        setIsScrolling(scrollContainer.scrollTop > 0)
    };


    const fetchAllLeaderboards = async () => {
        setIsLoading(true);
        try {
            const [levelLeaderboard, pointsLeaderboard] = await Promise.all([
                getLevelLeaderboard(),
                getPointsLeaderboard(),
            ]);
            const duplicateData = (data: any[]) => {
                return data.flatMap(entry => Array(5).fill(entry));
            };
            setLeaderboardData({
                level: (levelLeaderboard.filter((entry: LeaderboardEntry) => entry)),
                points: (pointsLeaderboard.filter((entry: LeaderboardEntry) => entry)),
            });
        } catch (error) {
            console.error('Error retrieving leaderboards:', error);
            setLeaderboardData({ level: [], points: [] });
        }
        setIsLoading(false);
    };

    const tabs = ['Level', 'Points'];

    const [modalImage, setModalImage] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


    const showModal = (imageUrl: string) => {
        setModalImage(imageUrl);
        setIsModalOpen(true);
    };

    const hideModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="p-4 text-black">
            <Tab.Group>
                <Tab.List className="flex p-1 space-x-1">
                    {tabs.map(tab => (
                        <Tab key={tab}
                            onClick={() => { setCurrentTab(tab.toLocaleLowerCase() as LeaderboardType) }}
                            style={{cursor:"pointer",fontFamily:"GLY",fontWeight:"300",textTransform:"uppercase", width: "100px", fontSize: "24px", borderRadius: "3px", transition: "background-color 0.2s ease 0s, color 0.2s ease 0s" }}

                            className={({ selected }) =>
                                `py-2 text-center font-bold text-lg
                                 ${selected ? 'bg-[#013359] text-white' : 'text-black hover:bg-[#013359] hover:text-white'}`}
                        >
                            {tab}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels>
                    {tabs.map((tab, idx) => (
                        <Tab.Panel key={idx} className="mt-1 p-1">
                            {isLoading ? (
                                <p style={{fontFamily:"GLY"}}>Loading...</p>
                            ) : (
                                <>
                                    <style>{`
                                    .table-header {
                                        color: #013359;
                                        border-top: 3px solid #013359;
                                        border-bottom: 3px solid #013359;
                                        border-radius: 10px;
                                        font-size: 24px;
                                        transition: background 0.2s ease-in-out;
                                    }

                                    @media (max-width: 768px) {
                                        .ltable-header {
                                            font-size:24px
                                        }
                                    `}
                                    </style>
                                    <div onScroll={handleScroll} style={{ overflowX: "auto", overflowY: "auto", height: isMobile ? "75vh" : "70vh", width: "100%", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                        <table className="w-full">
                                            <thead className='table-header' style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                                <tr style={{ borderRadius: "3px", fontFamily: "GLY",textTransform:"uppercase", fontSize: "1.5rem" }}>
                                                    <th className="p-2 text-center">Rank</th>
                                                    <th className="p-2 text-center"></th>
                                                    <th className="p-2 text-center">User</th>
                                                    <th className="p-2 text-center" style={{whiteSpace: 'nowrap'}}><img src={tab=="Points"?(isScrolling?'/flamer.svg':'/flamer-red.svg'):isScrolling?'/fist.svg':'/fist-red.svg'} style={{ marginRight: "3px", width: "32px", marginTop:"-3px", display: 'inline-block', verticalAlign: 'middle' }} alt="" />{tab}</th>
                                                    <th className="p-2 text-center">Address</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {leaderboardData[currentTab].map((entry, index) => (
                                                    <tr key={index} className="">
                                                        <td className="p-2 text-center" style={{ fontFamily: "GLY", fontSize: "1.5rem" }}>#{entry.rank}</td>
                                                        <td className="p-2 text-center" style={{ fontFamily: "GLY", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            {/*<img onClick={() => showModal("/char.png")} src="/char.png" style={{ cursor: "pointer", maxWidth: "70px", width: "70px", height: "70px", verticalAlign: "middle" }} alt="" />*/}
                                                            <CharacterDisplay username={entry.username} styles={{ cursor: "pointer", maxWidth: "70px", width: "70px", height: "70px", verticalAlign: "middle" }} character={entry.character}></CharacterDisplay>
                                                        </td>
                                                        <td onClick={()=>{window.open("https://play.fiverealms.ai/player/"+entry.username.toLowerCase(), '_blank')}} className="p-2 text-center" style={{ cursor:"pointer",fontFamily: "GLY", fontSize: "1.5rem" }}>
                                                            {entry.username.toUpperCase()}
                                                        </td>
                                                        <td className="p-2 text-center" style={{ fontFamily: "GLY", fontSize: "1.5rem" }}>
                                                            {currentTab === 'level' ? "LV."+(entry as LevelEntry).level : (entry as PointsEntry).points.toLocaleString()}
                                                        </td>
                                                        <td className="p-2 text-center" style={{ fontFamily: "GLY", fontSize: "1.5rem" }}>
                                                            {entry.address.toUpperCase().slice(0, 6) + "..." + entry.address.toUpperCase().slice(-4)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table></div>
                                    <div id="myModal" className="modal" style={{ display: "none", position: "fixed", zIndex: 1, left: 0, top: 0, width: "100%", height: "100%", overflow: "auto", backgroundColor: "rgba(0,0,0,0.4)" }}>
                                        <div className="modal-content" style={{ backgroundColor: "#fefefe", margin: "15% auto", padding: "20px", border: "1px solid #888", width: "80%" }}>
                                            <span className="close" onClick={hideModal} style={{ color: "#aaa", float: "right", fontSize: "28px", fontWeight: "bold", cursor: "pointer" }}>&times;</span>
                                            <img src="" id="modalImage" style={{ width: "100%" }} alt="Full Size" />
                                        </div>
                                    </div>
                                    {/*<SpringModal imageUrl={modalImage} isOpen={isModalOpen} onClose={hideModal} />*/}
                                </>
                            )}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default Leaderboard;

