import { createContext, useContext, useState } from "react";
import axios from 'axios'
import httpStatus from 'http-status'
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:3000"
})

export const AuthProvider = ({children}) => {

  const authContext = useContext(AuthContext)

  const [userData, setuserData] = useState(authContext)

  const router = useNavigate()

  const handleRegister = async (name, username, password) => {

    try {

        let response = await client.post('/register', {
          name: name,
          username: username,
          password: password
        } )
        
        if(response.status === httpStatus.CREATED){
          return response.data.message;
        }

    } catch (e) {
        throw e;
    }
 
  }

    const handleLogin = async (username, password) => {

    try {

        let response = await client.post('/login', {
          username: username,
          password: password
        } )
        // console.log(response)

        if(response.status === httpStatus.OK){
          localStorage.setItem("token", response.data.token)
          router('/')
        }
        
    } catch (e) {
        throw e;
    }
 
  }

  const data = {
    userData, setuserData, handleRegister, handleLogin
  }

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  )

}
