import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/utils"
import mongoose from "mongoose";
import countryAndcitymodel from "@/database/countryandcity";
import eventsmodel from "@/database/events";
import axios from "axios";
export async function POST(req: NextRequest) {
    const session:any = await getServerSession(authOptions)
    // console.log(session)
    const { location_data,latitude,longitude } = await req.json()
    const id = session.user.id
    // console.log('scrape events', id)
    await mongoose.connect(process.env.MONGO_URL!)
    // const countryAndCityData = await countryAndcitymodel.findOne({ id })
    const eventsData=await eventsmodel.find({id})
    // const {city,country}=countryAndCityData
    // console.log(countryAndCityData)
    // console.log('location data',location_data)
    // return NextResponse.json(countryAndCityData)
    // const countryAndCityData = await GetCountryAndCity(user.id)
    // const country = countryAndCityData.data.country.label
    // const state_or_city = countryAndCityData.data.city.label
    // const events = await getEvents(user.id)
    let data_to_upload:any[] = []
    // const timeInPM = { 1: 13, 2: 14, 3: 15, 4: 16, 5: 17, 6: 18, 7: 19, 8: 20, 9: 21, 10: 22, 11: 23, 12: 12 }
    // // const timeInAM = { 12: 0 }
    // // const AmorPm = ['AM', 'PM']
    const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    // // let actual_data = []

    async function checkDataCorrect(data: any, url: string,count=0) {
        // console.log('refetching distance api')
        // console.log(url)
        if (data.rows.length == 0) {
            if(count==4){
                return null
            }
            const checkAgain = await axios.get(url)
            return await checkDataCorrect(checkAgain.data,url,count+1)
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
                    headers: { 'x-api-key': `${process.env.SCRAPEIT_API_KEY}` }
                }

                let actualData;
                try {
                    const { data } = await axios.request(options)
                    // console.log(data)
                    actualData = data
                }
                catch (e) {
                    // this runs when no data property is in the results
                    // console.log(e)
                    continue
                    // reject('reject')
                    // dataExists = false
                }

                if (!actualData.eventsResults) {

                    // reject('reject')
                    continue
                    // dataExists = false
                }
                else {

                    for (let j of actualData.eventsResults) {
                        let duration:string=''
                        let distance: string = ''
                        const checkIfAlreadyExist = data_to_upload.find((uploaded: any) => uploaded.title == j.title)
                        // console.log('check if exist',checkIfAlreadyExist)
                        if (checkIfAlreadyExist) {
                            // console.log(checkIfAlreadyExist)
                            continue
                        }
                        const addressDestination = j.address.join(' ').replaceAll(' ', '%20')
                        const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${addressDestination}&origins=${latitude}%2C${longitude}&key=${process.env.GOOGLE_API_KEY}`
                        let checkingDistance:any = await axios.get(distanceUrl)
                        checkingDistance=await checkDataCorrect(checkingDistance.data,distanceUrl)
                        // console.log(checkingDistance)
                        if(!checkingDistance){
                            continue
                        }
                        // console.log(distanceUrl)
                        // console.log('checking distance data', checkingDistance.rows[0].elements[0])
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
        

        // console.log(data_to_upload)
        // resolve('done')
        // console.log('data to upload',data_to_upload)
        console.log(data_to_upload)
        if (data_to_upload.length == 0) {
            reject('reject')
            // return NextResponse.json({msg:'No Events Exists'})
        }
        else {
            resolve('done')
            // return NextResponse.json({ msg: 'Events Exists',data:data_to_upload })
        }

        // if (dataExists) {
        //     console.log(data_to_upload)
        //     return NextResponse.json('done')

            // console.log(dataExists)
            // return NextResponse.json('done')
            // const functionThatReturnPromise = () => new Promise(async (resolve, reject) => {
            //     const data = await axios.post(`${process.env.REACT_APP_BASE_URL}/upload/to/google-calendar`, { data_to_upload })
            //     if (data.status == 200) {
            //         resolve('done')
            //     }
            //     else {
            //         reject('rejected')
            //         Cookies.remove('Events_Session')
            //         Cookies.remove('Events_Session.sig')
            //         setTimeout(() => {
            //             navigate('/login')
            //         }, 3000)
            //     }
            // });
            // toast.promise(
            //     functionThatReturnPromise,
            //     {
            //         pending: 'Adding Events To Your Calendar...',
            //         success: 'Events Added Succesfully ',
            //         error: 'An Error Has Occured , Try Logging Back In 🤯'
            //     }
            // )
        }
    // }
    );
    
    try {
        const existornot = await Promise.all([fetchingEventsPromise])
        return NextResponse.json({ msg: 'Events Exists', data: data_to_upload })
    }
    catch {
        return NextResponse.json({ msg: 'No Events Exists' })
    }
    // if (existornot[0] == 'done') {
    //     return NextResponse.json({ msg: 'Events Exists', data: data_to_upload })
    // }
    // else {
    //     return NextResponse.json({ msg: 'No Events Exists' })
    // }
        // console.log('existornot',existornot)
    
    // return NextResponse.json('done')
    // toast.promise(
    //     fetchingEventsPromise,
    //     {
    //         pending: 'Fetching Events, Please Wait...',
    //         success: 'Fetched All Events ',
    //         error: 'No Events Exist For That Event On That Location'
    //     }
    // )
}