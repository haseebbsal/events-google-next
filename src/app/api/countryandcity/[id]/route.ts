import countryAndcitymodel from "@/database/countryandcity";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest, { params: { id } }: { params: { id: string } }) {
    await mongoose.connect(process.env.MONGO_URL!)
    const data = await countryAndcitymodel.findOne({ id },{_id:0,__v:0,id:0})
    return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params: { id } }: { params: { id: string } }) {
    const data = await req.json()
    await mongoose.connect(process.env.MONGO_URL!)
    const addingData = await countryAndcitymodel.updateOne({ id: id }, { $set: { ...data } },{upsert:true})
    return NextResponse.json(addingData)
}