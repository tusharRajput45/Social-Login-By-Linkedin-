const mongoose=require('mongoose')

const Schema=new mongoose.Schema({
    name:{
       type:String,
       require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        default:''
    },
    email_varified:{
        type:Boolean,
        default:false
    },
    
}
)
const linkedinModel=mongoose.model('linknedinModel',Schema)

module.exports=linkedinModel