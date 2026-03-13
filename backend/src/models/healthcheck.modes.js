import mongoose, {Schema} from "mongoose";

const healthCheckSchema = new Schema({
    
},
{
    timestamps : true
})
export const HealthCheck = mongoose.model("HealthCheck",healthCheckSchema)