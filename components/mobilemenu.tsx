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

const MobileMenu = (props: { userSignedUp: boolean, address: any; }) => {
    const router = useRouter()

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="IconButton" aria-label="Customise options">
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
                    <DropdownMenu.Item onClick={()=>{router.push("/")}} className="DropdownMenuItem">
                        Home
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="DropdownMenuSeparator" />
                    {props.address&&props.userSignedUp&&<><DropdownMenu.Item onClick={()=>{router.push("/play")}} className="DropdownMenuItem">
                        Play
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="DropdownMenuSeparator" />
                    
                    <DropdownMenu.Item onClick={()=>{router.push("/profile")}} className="DropdownMenuItem">
                        Profile
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="DropdownMenuSeparator" />
                    <DropdownMenu.Item onClick={()=>{router.push("/realms")}} className="DropdownMenuItem">
                        Realms
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="DropdownMenuSeparator" /></>}
                    


                </DropdownMenu.Content>
                </>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default MobileMenu;