import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://deepakkumarsen2008:Deepak2008@cluster0.21nfsbx.mongodb.net/food-del")
    .then(()=>console.log("DB Connected"))
}