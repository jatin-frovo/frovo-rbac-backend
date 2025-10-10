import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
export default dbConnect;