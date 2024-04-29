import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema({
    id: {
        type: String,
        required:true
    },
    name: {
        type: String,
        required:true
    }

})

let eventsmodel = mongoose.models['events']
if (!eventsmodel) {
    eventsmodel=mongoose.model('events',eventsSchema)
}

export default eventsmodel