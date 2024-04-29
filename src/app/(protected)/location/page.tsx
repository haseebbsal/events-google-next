import { authOptions } from "@/lib/utils"
import ChangeLocation from "@/components/ChangeLocation"
import { getServerSession } from "next-auth"

type countryCityData = {
    country: {
        firstLetter: string,
        label: string
    },
    city: {
        firstLetter: string,
        label: string
    }
}

export default async function Location() {
    const session:any = await getServerSession(authOptions)
    return (
        <>
            <ChangeLocation id={session.user.id} />
        </>
    )
}