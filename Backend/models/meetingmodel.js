import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    meetingCode: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now()
    },
})

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting }