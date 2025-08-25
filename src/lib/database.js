
import mongoose from 'mongoose'

export const connectDatabase = async ()=>{
    try {
        const connect = await  mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database connected ${connect.connection.host}`);
    }catch (error){
        console.log("Error Connecting to the database ",error)
        process.exit(1)
    }
}