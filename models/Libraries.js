const mongoose =  require('mongoose')
const {Schema} = mongoose

const librarySchema = new Schema({
    libraryId : {
        type : String,
        required : true, 
        unique : true
    }, 
    name : {
        type : String, 
        // required : true,
        // unique : true,

    }, 
    entryBy : {
        type : Schema.Types.ObjectId, 
        required : true 

    },
    // books :[
    //     {type : Schema.Types.ObjectId, 
    //         ref : "User"
    //     }
    // ]

},{
    timestamps : true
})

module.exports = mongoose.model("Library",librarySchema )