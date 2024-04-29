import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AddEvents from "@/components/AddEvents"
import { getServerSession } from "next-auth"

export default async function Events() {
    const session = await getServerSession(authOptions)
    
    return (
        <>
            <AddEvents id={session.user.id} />
        </>
    )
}