'use client'
import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    HamburgerMenuIcon,
    DotFilledIcon,
    CheckIcon,
    ChevronRightIcon,
} from '@radix-ui/react-icons';
import './mobilemenustyle.css';
import { useRouter } from 'next/navigation';

const DesktopMenu = (props: { userSignedUp: boolean, address: any; }) => {
    const router = useRouter()

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button style={{cursor:"pointer"}} className="IconButton" aria-label="Customise options">
                    <HamburgerMenuIcon />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <>
                <style>
                    {`
                    .DropdownMenuContent {
                        z-index: 9999 !important;
                    }
                    .DropdownMenuItem {
                        font-family: DM Sans;
                        font-size: 1.2rem;
                    }
                    `}
                </style>
                <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
                    <DropdownMenu.Item style={{cursor:"pointer"}} onClick={()=>{router.push("/")}} className="DropdownMenuItem">
                        Home
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="DropdownMenuSeparator" />
                    <DropdownMenu.Item style={{cursor:"pointer"}} onClick={()=>{router.push("/realms")}} className="DropdownMenuItem">
                        Realms
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="DropdownMenuSeparator" />
                    <DropdownMenu.Item className="DropdownMenuItem">
                        <a 
                            target="_blank"
                            href="https://x.com/TheFiveRealms"
                            rel="noopener noreferrer"
                        >Twitter</a>
                    </DropdownMenu.Item>
                    
                    


                </DropdownMenu.Content>
                </>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default DesktopMenu;