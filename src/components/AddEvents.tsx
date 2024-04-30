'use client'

import { TextField } from "@mui/material"
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { RiLoader3Fill } from "react-icons/ri";


type NewEvents = { value: string, id: number, uploadid: string }
type UploadedEvents = {
    name: string,
    _id: string
}
export default function AddEvents({ id }: { id: string }) {
    const queryclient = useQueryClient()
    const uploadEventsMutation = useMutation((data: [] | NewEvents[] | UploadedEvents[] | (NewEvents | UploadedEvents)[]) => fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/upload`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(e => e.json()),
        {
            onSuccess() {
                queryclient.invalidateQueries(['events', id])
            },
        }
    )
    const mutation = useMutation((id:string) => fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${id}`, { method: 'POST', body: JSON.stringify({ _id: id }), headers: { 'Content-Type': 'application/json' } }).then(e => e.json()),
        {
            onSuccess() {
                queryclient.invalidateQueries(['events',id])
            },
        }
    )
    const [uploadedEvents,setUploadedEvents]=useState<UploadedEvents[]|[]>([])
    const eventsQuery = useQuery(['events', id], ({ queryKey }) => fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${queryKey[1]}`).then(e=>e.json()), {
        refetchOnWindowFocus: false,
        onSuccess(data) {
            setUploadedEvents(data)
        },
        
    })
    let [newEvents, setNewEvents] = useState<[]|NewEvents[]>([])
    async function uploadNewEvents() {
        
        uploadEventsMutation.mutate([...newEvents, ...uploadedEvents])
        setNewEvents([])
    }

    function addNew() {
        setNewEvents([...newEvents,{value:'',id:newEvents.length+1,uploadid:id}])
    }

    async function deleteUploaded(id:string) {
        mutation.mutate(id)
    }

    async function deleteNewInput(num: number) {
        const filteredData = newEvents.filter((e,index) => e.id != num)
        setNewEvents(filteredData)
    }

    function handleNewChange(value:string, id:number) {
        const newEditedData = newEvents.map((e,index) => {
            if (e.id== id) {
                return ({...e, value })
            }
            return e
        })

        setNewEvents(newEditedData)
    }

    function handleChange(value:string, id:string) {
        const newEditedData = uploadedEvents.map((e:UploadedEvents) => {
            if (e._id == id) {
                return ({ ...e, name: value })
            }
            return e
        })

        setUploadedEvents(newEditedData)
    }

    if (eventsQuery.isLoading) {
        return (<div className="flex justify-center text-xl ">
            Loading Events
            <RiLoader3Fill  className='stroke-1 font-bold animate-spin m-1'/>
            </div>)
    }

    if (eventsQuery.isFetching) {
        return (<div className="flex justify-center text-xl ">
            Fetching New Events
            <RiLoader3Fill  className='stroke-1 font-bold animate-spin m-1'/>
            </div>)
    }
    return (
        <>

            <div className="flex gap-12 justify-center items-center">
                <h1 className="text-center text-3xl font-semibold">Add Events</h1>
                <Button onClick={() => { addNew() }} className=" !text-gray-900 !border-gray-900 self-center " variant="outlined" startIcon={<AddIcon />}>
                    ADD
                </Button>
            </div>
            <div className="h-full overflow-y-auto flex flex-col gap-4 p-4" >
                {
                    uploadedEvents?.map(e => {
                        return (
                            <div key={e._id} className="flex">
                                <TextField  onChange={(h) => { handleChange(h.target.value, e._id) }} defaultValue={e.name} name={`${e.name}`} fullWidth id="fullWidth" />
                                <Button id={`${e._id}`} onClick={() => { deleteUploaded(e._id) }} className="w-[20%] !text-gray-900 !border-gray-900 " variant="outlined">
                                    <DeleteIcon />
                                </Button>
                            </div>
                        )
                    })
                }
                {
                    newEvents?.map((e,index) => {
                        return (
                            <div key={e.id} className="flex">
                                <TextField defaultValue={e.value} onChange={(j)=>{handleNewChange(j.target.value,e.id)}} name={`Event ${e.id}`} fullWidth label={`For example: Book fairs, tech conferences etc`} id="fullWidth" />
                                <Button id={`${e.id}`} onClick={() => { deleteNewInput(e.id) }} className="w-[20%] !text-gray-900 !border-gray-900 " variant="outlined">
                                    <DeleteIcon />
                                </Button>
                            </div>
                        )
                    })
                }
                {/* {
                    

                        Events.map((e) =>
                            !!e._id ?
                                <div key={e._id} className="flex">
                                    <TextField onInput={(f) => { handleChange(f.target.value, e._id) }} defaultValue={e.name} name={`${e.name}`} fullWidth id="fullWidth" />
                                    <Button id={`${e._id}`} onClick={() => { deleteNew(e._id) }} className="w-[20%] !text-gray-900 !border-gray-900 " variant="outlined">
                                        <DeleteIcon />
                                    </Button>
                                </div>
                                :
                                <div key={e.uniqueid} className="flex">
                                    <TextField onInput={(f) => { handleNewChange(f.target.value, e.uniqueid) }} defaultValue={e.name} name={`New Input ${e.uniqueid}`} fullWidth label={`New Input ${e.uniqueid}`} id="fullWidth" />
                                    <Button id={`${e.uniqueid}`} onClick={() => { deleteNewInput(e.uniqueid) }} className="w-[20%] !text-gray-900 !border-gray-900 " variant="outlined">
                                        <DeleteIcon />
                                    </Button>
                                </div>
                        ) :
                        <SkeletonTypography loading={loading} />
                } */}
            </div>
            {(newEvents.length > 0) && <button className="flex m-auto backgroundcolor-hover shadow p-4 rounded self-center hover:shadow-lg" onClick={uploadNewEvents}>Submit Event Keywords</button>}
        </>
    )
}