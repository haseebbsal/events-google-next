import eventsmodel from "@/database/events";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
    const data = await req.json()
    await mongoose.connect(process.env.MONGO_URL!)
    data.map(async (e:any) => {
        if (e._id) {
            await eventsmodel.updateOne({_id:e._id},{$set:{name:e.name}})
        }
        else {
            await eventsmodel.create({id:e.uploadid,name:e.value})
        }
    })
    return NextResponse.json(data)
}