import eventsmodel from "@/database/events";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest,{params:{id}}:{params:{id:string}}) {
    await mongoose.connect(process.env.MONGO_URL!)
    const events = await eventsmodel.find({ id })
    return NextResponse.json(events)
}

export async function POST(request: NextRequest, { params: { id } }: { params: { id: string } }) {
    await mongoose.connect(process.env.MONGO_URL!)
    const events = await eventsmodel.deleteOne({ _id:id })
    return NextResponse.json(events)
}