'use client'

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState,useEffect } from "react";


export default  function AuthProvider({ children }: { children: React.ReactNode }) {
    const pathname=usePathname()
    const session: any = useSession();
    if (session.data.status=='loading') {
        return 'Wait Please'
    }
    console.log('session layout', session.status, session.data.error, session.status == 'authenticated',typeof window)
    if (session.status == 'authenticated') {
        if (session.data.error) {
            console.log('im here')
            if (typeof window != undefined) {
                console.log(window)
                signOut()
                return 'Session Expired'
            }
        }
    }
    return (
        <>
        {children}
        </>
    )
}