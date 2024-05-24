'use client'

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState,useEffect } from "react";


export default  function AuthProvider({ children }: { children: React.ReactNode }) {
    const pathname=usePathname()
    const session: any = useSession();
    console.log('session layout',session)
    // console.log('session',session)
    if (session.status=='loading') {
        return 'Wait Please'
    }
    if (session.status == 'authenticated') {
        if (session.data.error) {
            signOut()
            return 'Session Expired'
        }
    }
    return (
        <>
        {children}
        </>
    )
}