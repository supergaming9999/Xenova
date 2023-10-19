const { Schema, model } = require("mongoose");

const profileSchema = new Schema({
    userID: { $type: String, required: true, unique: true },
    username: { $type: String, required: true, unique: true },
    bank: { $type: Number, required: true, default: 0 },
    interestTime: { $type: Date },
    monkey: { $type: Number, required: true, default: 500 },
    dailyTime: { $type: Date },
    dailyStreak: { $type: Number, default: 0 }
}, { typeKey: "$type" });

const _model = model("profileModels", profileSchema);

module.exports = _model;