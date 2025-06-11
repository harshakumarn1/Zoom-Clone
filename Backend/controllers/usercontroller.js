import { User } from '../models/usermodel.js'
import httpStatus from 'http-status'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const register = async (req, res) => {
    let {username, name, password} = req.body;

    try {
      const existingUser = await User.findOne({username});

      if(existingUser){
        return res.status(httpStatus.FOUND).json({message:"user already exists"})
      }  
    
      const hashedPassword = await bcrypt.hash(password, 10);

      const registeredUser =await new User({
          username: username,
          name: name,
          password: hashedPassword
    }) 

    await registeredUser.save()
    console.log(registeredUser)

    res.status(httpStatus.CREATED).json({message: "user registered"});
           
    } catch (e) {
       res.status(httpStatus.IM_USED).json({message: "registration failed"})
    }
}

const login = async (req, res) => {
  let { username, password } = req.body;

  try {
    const user = await User.findOne({username: username})
    if(!user){
      return res.status(httpStatus.NOT_FOUND).json({message: "user not registered"})
    }
    const result = await bcrypt.compare(password, user.password)
    // console.log(result)
    if(!result){
      return res.status(httpStatus.UNAUTHORIZED).json({message: "invalid password"})
    } 
    let token = crypto.randomBytes(20).toString("hex")
    user.token = token
    await user.save()
    console.log(user)
    res.status(httpStatus.OK).json({token: `${user.token}`})
  } catch (e) {
    res.json({message: `something went wrong ${e}`})
  }
}

export { register, login }