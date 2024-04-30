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
    // const [fetchEvents,setFetchEvents]=useState(false)
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
    async function UploadToCalendar() {
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
        async function UploadToEventsCalendar(data:any) {
            // const token = await getToken({ req })
            const { accessToken } = session.data
            // const { data_to_upload } = await req.json()
            const data_to_upload=data
            // console.log('from calendar',data_to_upload)
            let promise_container = []
            for (let j of data_to_upload) {

                const waiting = fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST', body: JSON.stringify({
                        'summary': `${j.title}`,
                        'location': `${j.address}`,
                        'source': { 'title': `${j.title}`, 'url': `${j.link}` },
                        'description': `${j.description ? j.description : 'No Description'} , the distance is ${j.distance} and duration is ${j.duration}`,
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
            try {
                const uploadingToCalendar = await Promise.all(promise_container)
                console.log('done uploading to calendar')
                return { msg: 'Done Uploading', accessToken }

            }
            catch (e) {
                console.log(e)
                console.log('failed to upload')
                return { msg: 'failed to upload', accessToken }
            }
        }
        async function fetchEvents() {
            // const session: any = await getServerSession(authOptions)
            // console.log(session)
            // { location_data: addressQuery.data, latitude, longitude, id: session.data?.user!.id }
            const location_data = addressQuery.data
            // const { location_data, latitude, longitude } = await req.json()
            const id = session.data.user.id
            // console.log('scrape events', id)
            // await mongoose.connect(process.env.MONGO_URL!)
            // const countryAndCityData = await countryAndcitymodel.findOne({ id })
            // const eventsData = await eventsmodel.find({ id })
            const fetchEventsApi = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${id}`)
            const eventsData=await fetchEventsApi.json()
            
            // const {city,country}=countryAndCityData
            // console.log(countryAndCityData)
            // console.log('location data',location_data)
            // return NextResponse.json(countryAndCityData)
            // const countryAndCityData = await GetCountryAndCity(user.id)
            // const country = countryAndCityData.data.country.label
            // const state_or_city = countryAndCityData.data.city.label
            // const events = await getEvents(user.id)
            let data_to_upload: any[] = []
            // const timeInPM = { 1: 13, 2: 14, 3: 15, 4: 16, 5: 17, 6: 18, 7: 19, 8: 20, 9: 21, 10: 22, 11: 23, 12: 12 }
            // // const timeInAM = { 12: 0 }
            // // const AmorPm = ['AM', 'PM']
            const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            // // let actual_data = []

            async function checkDataCorrect(data: any, url: string, count = 0) {
                // console.log('refetching distance api')
                // console.log(url)
                if (data.rows.length == 0) {
                    if (count == 4) {
                        return null
                    }
                    const checkAgain = await fetchDistance(url)
                    return await checkDataCorrect(checkAgain, url, count + 1)
                }
                return data
            }
            const fetchingEventsPromise = new Promise(async (resolve, reject) => {
                // let dataExists = true
                const runLoopData = eventsData.length == 0 ? [{ name: '' }] : eventsData
                for (let j of location_data) {
                    for (let x of runLoopData) {

                        const options = {
                            method: 'GET',
                            url: 'https://api.scrape-it.cloud/scrape/google/events',
                            params: { q: `${x.name} Events in ${j}`, location: `${j}`, gl: 'us', hl: 'en' },
                            headers: { 'x-api-key': `${process.env.NEXT_PUBLIC_SCRAPEIT_API_KEY}` }
                        }

                        let actualData;
                        try {
                            const { data } = await axios.request(options)
                            console.log(data)
                            actualData = data
                        }
                        catch (e) {
                            continue

                        }

                        if (!actualData.eventsResults) {
                            continue
                        }
                        else {

                            for (let j of actualData.eventsResults) {
                                let duration: string = ''
                                let distance: string = ''
                                const checkIfAlreadyExist = data_to_upload.find((uploaded: any) => uploaded.title == j.title)
                                if (checkIfAlreadyExist) {
                                    continue
                                }
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
                                data_to_upload.push({ title: j.title, description: j.description, address: j.address.join(' '), start: startDate, end: endDate, link: j.link, duration, distance })
                            }

                        }
                    }
                }

                console.log(data_to_upload)
                if (data_to_upload.length == 0) {
                    reject('reject')
                }
                else {
                    resolve('done')
                }
            }
            );

            try {
                const existornot = await Promise.all([fetchingEventsPromise])
                return { msg: 'Events Exists', data: data_to_upload }
            }
            catch {
                return { msg: 'No Events Exists' }
            }
        }
        const eventsData = await fetchEvents()
        if (eventsData.msg == 'Events Exists') {
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
            const uploading = await UploadToEventsCalendar(eventsData.data)
            if (uploading.msg == 'Done Uploading') {
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
            // uploadCalendarMutation.mutate(data.data)
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
        console.log(eventsData)
        // getEventsMutation.mutate({ location_data: addressQuery.data, latitude, longitude,id:session.data?.user!.id })
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