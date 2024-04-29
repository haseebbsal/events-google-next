'use client'
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
type Session = { email: string, id: string, image: string, name: string }
export default function Navbar() {
    const pathname = usePathname()
    const [latitude, setLatitude] = useState<null | number>(null)
    const [longitude, setLongitude] = useState<null | number>(null)
    const session: any = useSession()
    console.log('navbar',session)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                setLatitude(latitude)
                setLongitude(longitude)
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, [])
    const addressQuery = useQuery(['addressInfo', latitude, longitude], ({ queryKey }) => fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${queryKey[1]},${queryKey[2]}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`).then(e => e.json()), {
        enabled: !!latitude && !!longitude,
        refetchOnWindowFocus: false,
        select(data) {
            return data.results.map((e: any) => e.formatted_address)
        },
    })
    const uploadCalendarMutation = useMutation((data: any) => fetch(`${process.env.NEXT_PUBLIC_SCRAP_BACKEND}/upload/calendar`,{method:'POST',body:JSON.stringify({data_to_upload:data,accessToken:session.data.accessToken}),headers:{'Content-Type':'application/json'}}).then(e => e.json()), {
        onSuccess(data) {
            if (data.msg == 'Done Uploading') {
                toast.success('Events Uploaded SuccessFully', {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",

                })
            }
            else {
                toast.error('Events Failed To Upload, Try Again', {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",

                })
                
            }
            console.log(data)
        },
    })
    const getEventsMutation = useMutation((data: any) => fetch(`${process.env.NEXT_PUBLIC_SCRAP_BACKEND}/scrap/events`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(e => e.json()), {
        onSuccess(data) {
            if (data.msg == 'Events Exists') { 
                toast.success('Events Fetched SuccessFully', {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",

                })
                toast.success('Uploading To Calendar...', {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",

                })
                uploadCalendarMutation.mutate(data.data)
            }
            else {
                toast.error('No Events Exist In Your Location', {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",

                })
            }
            console.log(data)
        },
    })
    function UploadToCalendar() {
        toast.success('Fetching Events....', {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "colored",

        })
        getEventsMutation.mutate({ location_data: addressQuery.data, latitude, longitude,id:session.data?.user!.id })
        console.log('upload function')
    }
    return (
        <div className="flex lg:flex-row md:flex-row sm:flex-row flex-col gap-4 justify-between mb-4 p-4 bg-blue-300 bg-opacity-70" >
            <div className="self-center text-gray-900 font-bold text-xl flex gap-2 items-center justify-center "><FcGoogle className="text-3xl" /> Google Events Upload</div>
            <div className="flex gap-2 self-center ">
                <button disabled={addressQuery.data==undefined} className=" bg-white backgroundcolor-hover shadow p-4 rounded self-center hover:shadow-xl" onClick={UploadToCalendar}>Upload</button>
                <Link className={pathname == '/location' ? ' bg-white shadow p-4 rounded self-center hover:shadow-xl' : 'bg-white shadow  p-4 rounded self-center hover:shadow-xl'}  href={'/location'}>Location</Link>
                <Link className={pathname == '/events' ? 'bg-white shadow p-4 rounded self-center hover:shadow-xl' : ' bg-white shadow  p-4 rounded self-center hover:shadow-xl'}   href={'/events'}>Events</Link>
                <button className=" backgroundcolor-hover bg-white shadow p-4 rounded self-center hover:shadow-xl" onClick={() => {
                    signOut()
                }} >Log Out</button>
            </div>
        </div>
    )
}