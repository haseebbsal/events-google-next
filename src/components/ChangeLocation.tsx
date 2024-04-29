'use client'
import RenderGroup from '@/groups/RenderGroup'
import RenderGroup2 from '@/groups/RenderGroup2'
import { FormEvent, useEffect } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

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
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, [])
    const addressQuery = useQuery(['addressInfo', latitude, longitude], ({ queryKey }) => fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${queryKey[1]},${queryKey[2]}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`).then(e=>e.json()), {
        enabled:!!latitude&&!!longitude,
        refetchOnWindowFocus: false,
        select(data) {
            return data.results.map((e:any)=>e.formatted_address)
        },
    })
    // const queryclient = useQueryClient()
    // const mutation = useMutation((data:countryCityData) => fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/countryandcity/${id}`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(e=>e.json()), {
    //     onSuccess() {
    //         queryclient.invalidateQueries(['userCountryCity',id])
    //     },
    // })
    // const countryData = useQuery('countries', () => fetch('https://countriesnow.space/api/v0.1/countries').then(e => e.json()), {
    //     select(data) {
    //         return data.data.map((e: any) => e.country)
    //     },
    //     refetchOnWindowFocus: false,
    // })
    // let userData = useQuery(['userCountryCity', id], ({ queryKey }) => fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/countryandcity/${queryKey[1]}`).then(e => e.json()), {
    //     refetchOnWindowFocus: false,
    //     onSuccess(data) {
    //         if (!data) {
    //             setCountry({
    //                 country: {
    //                     firstLetter: '',
    //                     label: ''
    //                 },
    //                 city: {
    //                     firstLetter: '',
    //                     label: ''
    //                 }
    //             })
    //             return
    //         }
    //         setCountry(data)

    //     },
    // })
    // let [country, setCountry] = useState<countryCityData>({
    //     country: {
    //         firstLetter: '',
    //         label: ''
    //     },
    //     city: {
    //         firstLetter: '',
    //         label: ''
    //     }
    // })
    // const cityData = useQuery(['cities', country?.country.label], ({ queryKey }) => fetch('https://countriesnow.space/api/v0.1/countries/cities', { method: 'POST', body: JSON.stringify({ country: queryKey[1] }), headers: { 'Content-type': 'application/json' } }).then(e => e.json()), {
    //     enabled: !!country?.country.label,
    //     refetchOnWindowFocus:false
    // })
    if (addressQuery.isLoading) {
        return 'Loading Data...'
    }

    // if (addressQuery.isFetching) {
    //     return 'Fetching Location...'
    // }
    // function handleSubmit(e:FormEvent) {
    //     e.preventDefault()
    //     mutation.mutate(country)
    // }
    // console.log(addressQuery)
    // console.log(addressQuery.data)
    return (
        <>
            <p>Your Locations</p>
            {
                addressQuery.data?.map((e:any,index:number) => <p  key={index}>{e}</p>)
            }
        </>
        
        // <form className="mb-4 text-xl text-center" onSubmit={handleSubmit}>
        //     {/* <h1 className="mb-4">Change Location In Events</h1>
        //     <RenderGroup countriesData={countryData.data} setCountry={setCountry} country={country} />
        //     <RenderGroup2  countriesData={cityData.data?cityData.data.data:[]} setCountry={setCountry} country={country} />
        //     {country.city?.label && country.country?.label && <button className="backgroundcolor-hover  shadow py-2 px-4  rounded self-center" type="submit">Submit</button>} */}
        // </form>
    )
}