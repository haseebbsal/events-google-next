import { authOptions } from "@/lib/utils"
import AddEvents from "@/components/AddEvents"
import { getServerSession } from "next-auth"

export default async function Events() {
    const session:any = await getServerSession(authOptions)
    return (
        <>
            <AddEvents id={session.user.id} />
        </>
    )
}