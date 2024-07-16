const express = require('express');
const router = express.Router();

const axios=require('axios')
const jwt=require('jsonwebtoken')
const varifyToken=require('../middleware/varifyToken')
const cookie=require('cookie-parser')
const session = require('express-session');

const bodyparser=require('body-parser')


const linkedinModel=require('../model/linkedinModel.js')

router.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

router.use(bodyparser.json())
router.use(bodyparser.urlencoded({extended:true}))

const createToken = async (_id) => {
  try {
    const payload = { _id };
    const token = await jwt.sign(payload, 'yourSecretKey', { expiresIn: 604800 });
    return token;
  } catch (error) {
    console.log(error.message);
  }
}
router.get('/signup',async(req,res)=>{
    try {
      res.render('pages/signup')
    } catch (error) {
      console.log(error.message);
    }
})
router.post('/signup',async(req,res)=>{
  console.log(req.body);
  try { 
    const data=new linkedinModel({
      name:req.body.name,
      email:req.body.email,
      password:req.body.password
    })
    const saveData=await data.save()
    if (saveData) {
      res.render('pages/index',{
        "Success":'true',
        "StatusCode":'200',
        "message":'successfully save data'
      })
    } else {
      res.json({
        "Success":'true',
        "StatusCode":'400',
        "message":'data not save'
      })
    }
  } catch (error) {
    res.json({
      "Success":'false',
      "StatusCode":'500',
      "message":'Server error',
      'error':error.message
    })
  }
})
router.get('/',async(req,res)=>{
  try {
    res.render('pages/index')
  } catch (error) {
   res.json({
      "Success":'false',
      "StatusCode":'500',
      "message":'Server error',
      'error':error.message
   })
  }
})
router.post('/login',async(req,res)=>{
   try {
    const checkEmail=await linkedinModel.findOne({email:req.body.email})
    if (!checkEmail) {
      res.json({
        "Success":'true',
         "StatusCode":'200',
         "message":'Email is not exist',
      })
    } else {
      console.log(checkEmail.password);
      console.log(req.body.password);
      if (checkEmail.password==req.body.password) {
        const token=await createToken(checkEmail._id)
        res.cookie('token', token, {
          httpOnly: true, 
          maxAge: 3600000, 
      });
        res.redirect('/dashboard')
      } else {
        res.json({
           "Success":'true',
           "StatusCode":'200',
           "message":'password is not matched',
        })
      }
    }
   } catch (error) {
   res.json({
     "Success":'false',
      "StatusCode":'500',
      "message":'Server error',
      'error':error.message
   })
   }
})
router.get('/auth/linkedin/callback', async (req, res) => {
  try {
    if (req.query.code) {
      const tokenResponse = await getToken(req.query.code);
      
      if (tokenResponse.data.access_token) {
        const userResponse = await getUser(tokenResponse.data.access_token);
        
        if (userResponse.data) {
          const existingUser = await linkedinModel.findOne({ email: userResponse.data.email });
          
          if (!existingUser) {
            const newUser = new linkedinModel({
              name: userResponse.data.name,
              email: userResponse.data.email,
              email_verified: userResponse.data.email_verified
            });
            
            const savedUser = await newUser.save();
            const token = await createToken(savedUser._id);
            
            res.cookie('token', token, {
              httpOnly: true, 
              maxAge: 3600000, 
          });// Assuming you have a cookie middleware
            res.redirect('/dashboard');
          } else {
            const token = await createToken(existingUser._id);
                res.cookie('token', token, {
                  httpOnly: true, 
                  maxAge: 3600000, 
              });
            res.redirect('/dashboard');
          }
        } else {
          res.send('User data not retrieved');
        }
      } else {
        res.send('Access token not retrieved');
      }
    } else {
      res.send('No code parameter found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      data: 'Server error',
      statusCode: '500'
    });
  }
});
 let getToken= async(code)=>{
  const response = await axios({
    url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&client_id=77u3fa0v6n2ps7&client_secret=5ugB8Pt5dMAQL4uw&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flinkedin%2Fcallback`,
    method: "get",
  });
  return response 
}

let getUser=async (token)=>{
  const response = await axios({
    url: `https://api.linkedin.com/v2/userinfo`,
    method: "get",
    headers:{
      'Authorization': `Bearer ${token}`,
    }
  }); 
  return response
}  
router.get('/dashboard',varifyToken,async(req,res)=>{
  const getUser=await linkedinModel.findOne({_id:req.userId})
  try {
   res.render('pages/dashboard',{Result:getUser})
  } catch (error) {
    res.json({
      "Success":'false',
       "StatusCode":'500',
       "message":'Server error',
       'error':error.message
    })
  } 
})          
router.get('/logout',async(req,res)=>{
  try {
    res.clearCookie('token');
    res.redirect('/')
  } catch (error) {
    res.json({
      "Success":'false',
       "StatusCode":'500',
       "message":'Server error',
       'error':error.message
    })
  }
})     
  

module.exports = router;