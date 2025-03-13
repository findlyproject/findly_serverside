import mongoose, { Schema } from "mongoose";

const ApplicationSaveSchema = new Schema({
    companyId: {type:Schema.Types.ObjectId,ref:"Company",required:true},
    applicationId: {type:Schema.Types.ObjectId,ref:"JobApplication",required:true},
    timestamp: {
        type: Date,
        default: Date.now,
      },
})

export const ApplicationSave = mongoose.model("applicationSave",ApplicationSaveSchema);

