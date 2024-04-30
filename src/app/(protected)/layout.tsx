import React from "react";
import Navbar from "@/components/Navbar";
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