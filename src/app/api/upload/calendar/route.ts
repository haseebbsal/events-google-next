import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const token = await getToken({ req })
    const { accessToken } = token!
    const { data_to_upload } = await req.json()
    // console.log('from calendar',data_to_upload)
    let promise_container = []
    for (let j of data_to_upload) {

        const waiting = fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST', body: JSON.stringify({
                'summary': `${j.title}`,
                'location': `${j.address}`,
                'source': { 'title': `${j.title}`, 'url': `${j.link}`},
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
        return NextResponse.json({ msg: 'Done Uploading', accessToken })
        
    }
    catch (e) {
        console.log(e)
        console.log('failed to upload')
        return NextResponse.json({ msg: 'failed to upload', accessToken })
    }
}