'use client'
import { signIn, useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { FcGoogle } from "react-icons/fc";
export default function HomePage() {
    const session = useSession()    
    if (session.data) {
        redirect('/location')
    }
    return (
        <>
            <p>
                <FcGoogle/>
                Home Page
                <button onClick={()=>{signIn('google',{redirect:false,callbackUrl:'/location'})}}>Sign In</button>
            </p>
        </>
    )
}