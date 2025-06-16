import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../contexts/Authcontext.jsx';
import Snackbar from '@mui/material/Snackbar';
import '../App.css'
import { useNavigate } from 'react-router-dom';


// TODO remove, this demo shouldn't need to reset the theme.

export default function Authentication() {

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)

    const routeTo = useNavigate();


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {

        try {

            if (formState === 0) {
                await handleLogin(username, password)
                setUsername("");
                setPassword("")
                setError("")
                routeTo('/home')
            }

            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                // console.log(result);
                setName("")
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
                routeTo('/auth')
            }
        } catch (err) {
            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }


    return ( 
    
      <div className='flex flex-row'>
         <div>
             <img className='h-[100vh] w-[100vw]' src="https://hips.hearstapps.com/hmg-prod/images/alpe-di-siusi-sunrise-with-sassolungo-or-langkofel-royalty-free-image-1623254127.jpg?crop=1xw:1xh;center,top&resize=980:*"/>
         </div> 
        
        <div className='auth-div flex flex-col'>
            
         <div className='flex justify-center'>
              <div className='text-white bg-purple-400 rounded-full h-8 w-8 text-center'><LockOutlinedIcon /></div>
         </div>

        <div className='flex justify-center'>
            <Button variant={formState === 0 ? "contained" : ""} onClick={() => { setFormState(0) }}>
                Sign In
            </Button>
            <Button variant={formState === 1 ? "contained" : ""} onClick={() => { setFormState(1) }}>
                Sign Up
            </Button>
        </div>

        <form action="#" className='text-center'>
                             
        {formState === 1 ? <TextField                                
            required                    
            id="name"
            label="Full Name"
            name="name"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
        /> : <></>}

        <TextField                                
            required                         
            id="username"
            label="Username"
            name="username"
            value={username}
            autoFocus
            onChange={(e) => setUsername(e.target.value)}
            />

            <TextField                               
                required                               
                name="password"
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
            />
            <p style={{ color: "red", marginBottom: "1rem", marginTop: "0" }}>{error}</p>

            <Button
                type="button"                               
                variant="contained"                             
                onClick={handleAuth}
            >
            {formState === 0 ? "Login " : "Register"}
            </Button>
        </form>

        <Snackbar
            open={open}
            autoHideDuration={4000}
            message={message}
        />

        </div>

      </div>

    );
}