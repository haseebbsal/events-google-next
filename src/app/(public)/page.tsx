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
            <div className="flex gadiv-4 flex-col justify-center items-center align-center h-[100vh]">
                <FcGoogle className="text-9xl"/>
                <h1 className="text-2xl font-semibold">Events Near My Route</h1>
                <button className="border border-solid border-yellow-400 rounded-lg border-4 p-1.5 bg-yellow-500 hover:opacity-20" onClick={()=>{signIn('google',{redirect:false,callbackUrl:'/location'})}}>Sign In</button>
            </div>
        </>
    )
}