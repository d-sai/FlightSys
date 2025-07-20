const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["course", "task", "topup"], 
        required: true 
    },
    description: String,
    referenceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: false ,
        default:null
    },
    amount: Number,
    balanceAfter: Number,
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);
