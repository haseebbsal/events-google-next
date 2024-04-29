import React from "react";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils"
import AuthProvider from "@/providers/AuthProvider";


export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
        <div>
            <Navbar/>
            {children}
            </div>
        </AuthProvider>
    )
}