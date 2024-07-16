const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/linkedinDB')
.then(()=>{
    console.log('Successfully connect database');
})
.catch(()=>{
    console.log('Not connect database');
})

module.exports=mongoose