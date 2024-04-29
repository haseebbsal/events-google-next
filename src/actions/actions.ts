'use server'
import axios from "axios"
export default async function fetchDistance(url:string) {
    
    let checkingDistance: any = await axios.get(url)
    console.log(checkingDistance.data)
    return checkingDistance
}