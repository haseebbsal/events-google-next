import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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
    const session = await getServerSession(authOptions)
    return (
        <>
            <ChangeLocation id={session.user.id} />
        </>
    )
}