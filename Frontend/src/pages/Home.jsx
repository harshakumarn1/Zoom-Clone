import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth"
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function Home() {

    let routeTo = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");

    let handleJoinVideoCall = async () => {
        routeTo(`/${meetingCode}`)
    }

    return (
        <>

            <div className="navBar h-[4rem] flex items-center justify-between w-[100%]">

                <div className="ml-16">
                    <h2 className="font-semibold text-2xl">Agni Video Call</h2>
                </div>

                <div className="mr-8">
                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        routeTo("/auth")
                    }}>
                        Log out
                    </Button>
                </div>

            </div>


            <div className="w-[100%] flex items-center justify-center">
                <div className="leftPanel">
                    <div>
                        <h2 className="font-bold text-2xl mb-4">Providing Quality Video Call</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src='/src/assets/logo3.png' className="w-[30rem]"/>
                </div>
            </div>
        </>
    )

}

export default withAuth(Home)
