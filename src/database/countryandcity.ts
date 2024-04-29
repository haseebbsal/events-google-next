import mongoose from "mongoose";
const countryAndcityschema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique:true
    },
    city: {
        type: {
            firstLetter: String,
            label:String
        }
    },
    country: {
        type: {
            firstLetter: String,
            label: String
        }
    }
})
let countryAndcitymodel:any
if (mongoose.models['country_cities']) {
    countryAndcitymodel = mongoose.models['country_cities']
}
else {
    countryAndcitymodel = mongoose.model('country_cities', countryAndcityschema)
}
export default countryAndcitymodel