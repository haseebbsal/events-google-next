'use client'
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import axios from "axios";
import fetchEvents from "@/actions/actions";
import fetchDistance from "@/actions/actions";
type Session = { email: string, id: string, image: string, name: string }
export default function Navbar() {
    const pathname = usePathname()
    const [latitude, setLatitude] = useState<null | number>(null)
    const [longitude, setLongitude] = useState<null | number>(null)
    const session: any = useSession()
    useEffect(() => {
        const { accessToken } = session.data
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                setLatitude(latitude)
                setLongitude(longitude)
                // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            });
        } else {
            // console.log("Geolocation is not supported by this browser.");
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
    async function UploadToCalendar() {
        async function UploadToEventsCalendar(data:any) {
            let eventsData:any=[]
            const { accessToken } = session.data
            async function getEventsCalendar(pageToken = null) {
                let waiting;
                if (!pageToken) {
                    waiting = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                }
                else {
                    waiting = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?pageToken=${pageToken}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                }
                
                const data = await waiting.json()
                eventsData=[...eventsData,...data.items]
                if (data.nextPageToken) {
                    return await getEventsCalendar(data.nextPageToken)
                }
                else {
                    return eventsData
                }
            }
            
            const items = await getEventsCalendar()
            const data_to_upload=data
            let promise_container = []
            for (let j of data_to_upload) {
                const findDuplicate = items.find((item: any) => item.description.includes(j.description))
                if (!findDuplicate) {
                    const waiting = fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                        method: 'POST', body: JSON.stringify({
                            'summary': `${j.title}`,
                            'location': `${j.address}`,
                            'source': { 'title': `${j.title}`, 'url': `${j.link}` },
                            'description': `${j.description ? j.description : 'No Description'} , the distance is ${j.distance} and duration is ${j.duration}, date of event: ${j.date}`,
                            'start': {
                                'dateTime': `${j.start}`,
                                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                            },
                            'end': {
                                'dateTime': `${j.end}`,
                                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                            }
                        }), headers: { 'Authorization': `Bearer ${accessToken}` }
                    })



                    promise_container.push(waiting)
                }
                

            }
            
            const uploadingToCalendar = Promise.all(promise_container)
            await toast.promise(
                uploadingToCalendar,
                {
                    pending: 'Uploading To Calendar',
                    success: 'Uploaded To Calendar Sucessfully 👌',
                    error: 'Error in Uploading 🤯'
                }
            )        
        }
        async function fetchEvents() {
            const location_data = addressQuery.data
            const id = session.data.user.id
            const fetchEventsApi = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${id}`)
            const eventsData = await fetchEventsApi.json()
            let data_to_upload:any=[]
            let totalEventsData: any = []
            const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            async function checkDataCorrect(data: any, url: string, count = 0) {
                if (data.rows.length == 0) {
                    if (count == 4) {
                        return null
                    }
                    const checkAgain = await fetchDistance(url)
                    return await checkDataCorrect(checkAgain, url, count + 1)
                }
                return data
            }
            async function getEventsFromAPI(x:any,j:any) {
                let start = 0
                let newData:any=[]
                while (true) {
                    let actualData;
                    const options = {
                        method: 'GET',
                        url: 'https://api.scrape-it.cloud/scrape/google/events',
                        params: { q: `${x.name} Events near ${j}`, location: `${j}`, gl: 'us', hl: 'en', start },
                        headers: { 'x-api-key': `${process.env.NEXT_PUBLIC_SCRAPEIT_API_KEY}` }
                    }
                    try {
                        const { data } = await axios.request(options)
                        actualData = data
                    }
                    catch (e) {
                        if (start == 100) {
                            return newData
                        }
                        start+=10
                        continue
                    }
                    if (!actualData.eventsResults) {
                        if (start == 100) {
                            return newData
                        }
                        start += 10
                        continue
                    }
                    else {
                        if (start == 100) {
                            newData=[...newData,...actualData.eventsResults]
                            return newData
                        }
                        else {
                            start+=10
                        }
                    }
                }
            }
            const fetchingEventsPromise = new Promise(async (resolve, reject) => {
                const runLoopData = eventsData.length == 0 ? [{ name: '' }] : eventsData
                runLoopData.push({name:''})
                for (let j of location_data) {
                    for (let x of runLoopData) {
                        const totalEventsDataWithLimit = await getEventsFromAPI(x, j)
                        for (let uploaded of totalEventsDataWithLimit) {
                            const findingDup = totalEventsData.find((inTotal: any) => inTotal.description == uploaded.description)
                            if (!findingDup) {
                                totalEventsData = [...totalEventsData, uploaded]
                            }
                        }
                    }
                }
                if (totalEventsData.length == 0) {
                    reject('reject')
                }
                else {
                    console.log(totalEventsData)
                    for (let j of totalEventsData) {
                        let duration: string = ''
                        let distance: string = ''
                        const addressDestination = j.address.join(' ').replaceAll(' ', '%20')
                        const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${addressDestination}&origins=${latitude}%2C${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
                        let checkingDistance: any = await fetchDistance(distanceUrl)
                        checkingDistance = await checkDataCorrect(checkingDistance, distanceUrl)
                        if (!checkingDistance) {
                            continue
                        }
                        const durationParent = checkingDistance.rows[0].elements[0]
                        if (durationParent.status == 'OK') {
                            const time_in_minutes = (durationParent.duration.value) / 60
                            if (time_in_minutes > 30) {
                                continue
                            }
                            duration = durationParent.duration.text
                            distance = durationParent.distance.text
                        }
                        else {
                            continue
                        }
                        // console.log(j)
                        const e = j.date.when
                        const datesFound = []
                        const currentYear = new Date().getFullYear()
                        const splittedData = e.split(' ')
                        for (let u = 0; u < splittedData.length; u++) {
                            for (let p of Months) {
                                if (splittedData[u] == p) {
                                    datesFound.push(splittedData[u])
                                    datesFound.push(splittedData[u + 1].replaceAll(',', ''))
                                }
                            }
                        }
                        let endDateYear = currentYear;
                        let endMonth = Months.indexOf(datesFound[0])
                        let endDay = parseInt(datesFound[1])
                        const indexOfStartMonth = Months.indexOf(datesFound[0])
                        const indexOfStartDay = parseInt(datesFound[1])
                        if (datesFound.length > 2) {
                            const indexOfEndMonth = Months.indexOf(datesFound[2])
                            endMonth = indexOfEndMonth
                            endDay = datesFound[3]
                            endDateYear = indexOfEndMonth < indexOfStartMonth ? currentYear + 1 : currentYear
                        }
                        const startDate = new Date(currentYear, indexOfStartMonth, indexOfStartDay).toISOString()
                        const endDate = new Date(endDateYear, endMonth, endDay).toISOString()
                        data_to_upload.push({ title: j.title, description: j.description, address: j.address.join(' '), start: startDate, end: endDate, link: j.link, duration, distance, date: j.date.when })
                    }
                    resolve('done')
                }
            }
            );

            
            const existornot = Promise.all([fetchingEventsPromise])
            await toast.promise(
                existornot,
                {
                    pending: 'Fetching Events...',
                    success: 'Events Fetched Successfully 👌',
                    error: 'No Events Exist 🤯'
                }
            )
            return { data:data_to_upload }
                
            
            
        }
        const eventsData = await fetchEvents()
        console.log(eventsData.data)
        const uploading = await UploadToEventsCalendar(eventsData.data)
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