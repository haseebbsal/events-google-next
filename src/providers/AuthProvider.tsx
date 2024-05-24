'use client'

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState,useEffect } from "react";


export default  function AuthProvider({ children }: { children: React.ReactNode }) {
    const pathname=usePathname()
    const session: any = useSession();
    // console.log('session layout',session)
    // console.log('session',session)
    if (session.data.status=='loading') {
        return 'Wait Please'
    }
    console.log('session layout', session.status, session.data.error, session.data.status == 'authenticated')
    console.log()
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