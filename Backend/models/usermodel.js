import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,   
    },
    name: {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", userSchema);

export { User }