'use client'
import { useEffect } from 'react'
import { useState } from 'react'
import { useQuery} from 'react-query'
import { RiLoader3Fill } from "react-icons/ri";

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
export default function ChangeLocation({ id }: { id: string }) {
    const [latitude, setLatitude] = useState<null | number>(null)
    const [longitude,setLongitude]=useState<null | number>(null)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                setLatitude(latitude)
                setLongitude(longitude)
            });
        } 
    }, [])
    const addressQuery = useQuery(['addressInfo', latitude, longitude], ({ queryKey }) => fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${queryKey[1]},${queryKey[2]}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`).then(e=>e.json()), {
        enabled:!!latitude&&!!longitude,
        refetchOnWindowFocus: false,
        select(data) {
            return data.results.map((e:any)=>e.formatted_address)
        },
    })
    if (addressQuery.isLoading) {
        
        return (<div className="flex justify-center text-xl ">
            Loading Data
            <RiLoader3Fill  className='stroke-1 animate-spin m-1'/>
            </div>)
    }
    return (
        <>
            <h1 className='flex justify-center text-4xl font-bold'>Locations on your route</h1>
            <br></br>
            <div>
                <hr className='border border-4 border-gray-400'></hr>
            </div>
            <ul className='m-4 list-disc'>
            {
                addressQuery.data?.map((e:any,index:number) => <li className='m-4 w-[50%]' key={index}>{e}</li>)
            }
            </ul>
            <hr className='border border-4 border-gray-400'></hr>
        </>
    )
}