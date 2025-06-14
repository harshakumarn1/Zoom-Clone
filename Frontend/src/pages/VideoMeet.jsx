 import { useState, useRef, useEffect } from "react";
 import TextField from '@mui/material/TextField';
 import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
 import '../css/VideoMeet.css'
 import io from 'socket.io-client'
 import  IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import { useNavigate } from "react-router-dom";


 let connections = {}

 const peerConfigConnections = {
    "iceServers": [
       {
        'urls': 'stun:stun.l.google.com:19302'
       }
    ]
 }


 export default function VideoMeet() {

  let socketRef = useRef()

  let socketIdRef = useRef()

  let localVideoRef = useRef()

  let [videoAvailable, setVideoAvailable] = useState(false)
  let [audioAvailable, setAudioAvailable] = useState(false)
  let [video, setVideo] = useState([])
  let [audio, setAudio] = useState()
  let [screen, setScreen] = useState()
  let [showModal, setModal] = useState()
  let [screenAvailable, setScreenAvailable] = useState()
  let [messages, setMessages] = useState([])
  let [message, setMessage] = useState("")
  let [newMessages, setnewMessages] = useState(5)
  let [askforUsername, setaskforUsername] = useState(true)
  let [username, setUsername] = useState("")
  const videoRef = useRef([])
  let [videos, setVideos] = useState([])
  let routeTo = useNavigate()

    // if(isChrome() === "false"){

    // }

    let getPermissions = async () => {
      try {

      let videoPermission = await navigator.mediaDevices.getUserMedia({video: true})

      if(videoPermission){
         setVideoAvailable(true)
      } else {
        setVideoAvailable(false)
      } 

      let audioPermission = await navigator.mediaDevices.getUserMedia({audio: true})

      if(audioPermission){
         setAudioAvailable(true)
      } else {
        setAudioAvailable(false)
      } 

      // console.log(navigator.mediaDevices.getDisplayMedia);

      if(navigator.mediaDevices.getDisplayMedia){
         setScreenAvailable(true)
      } else {
         setScreenAvailable(false)
      }

      if(videoAvailable || audioAvailable){
         const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable})
         if(userMediaStream){
            window.localStream = userMediaStream
            if(localVideoRef.current){
               localVideoRef.current.srcObject = userMediaStream
            }
         }
      }

      } catch (err) {
         console.log(err)
      }
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setnewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    }

    const server_url = "http://localhost:3000"

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false }) 

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        // console.log("BEFORE:", videoRef.current);
                        // console.log("FINDING ID: ", socketListId);
                        console.log(videoRef.current)

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let getMedia = () => {
      setVideo(videoAvailable)
      setAudio(audioAvailable)

      connectToSocketServer()
    }

    let connect = () => {
      setaskforUsername(false)
      getMedia()
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
      if((video && videoAvailable) || (audio && audioAvailable)){
         navigator.mediaDevices.getUserMedia({video: video, audio: audio})
         .then(getUserMediaSuccess)
         .then((stream) => {
         //   fgjdgjd
         })
         .catch((e) => {
            console.log(e)
         })
      } else {
         try {
           let tracks = localVideoRef.current.srcObject.getTracks() 
           tracks.forEach( track => track.stop() );
         } catch (err) {
            console.log(err)
         }
      }
    } 

    let getDisplayMedia = () => {
        if(screen) {
            if(navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }  
    }

    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let handleVideo = () => {
        setVideo(!video)
        // getUserMedia()
    }

    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia()
    }

    let handleScreen = () => {
        setScreen(!screen)
    }

    let sendMessage = () => {
      socketRef.current.emit("chat-message", message, username)
      setMessage("")
    }

    useEffect(() => {
      getPermissions()
    })

    useEffect(() => {
      if(video !== undefined && audio !== undefined){
         getUserMedia()
      }
    }, [audio, video])

    useEffect(()=> {
      if(screen !== undefined){
        getDisplayMedia()
      }
    },[screen])

    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        routeTo("/home")
    }
    
    return (
        <div>
            { askforUsername === true ?
            <div>
               <h2>Lobby</h2>
               <TextField
               required
               id="outlined-required"          
               placeholder="Username"
               value={username}
               onChange={e => {setUsername(e.target.value)}}
               />
               <Button variant="contained" onClick={connect}>connect</Button>

               <div>
                  <video ref={localVideoRef} autoPlay muted></video>
               </div>

            </div> : 

            <div className="w-[100vw] h-[100vh] relative bg-[#111111]">

                    { showModal ?
                    
                    <div className="absolute h-[37rem] w-[22%] bg-white right-0">

                        <div className="" style={{padding: "1rem"}}>
                            <h1>Chat</h1>

                            <div className="h-[30rem]">

                                {messages.length !== 0 ? messages.map((item, index) => {
                                    // console.log(messages)
                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No messages yet</p>}

                            </div>

                            <div className="" >
                                <TextField value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter Your Message" variant="outlined" />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>

                        </div>
                    </div> : <></>}

             {video ? <video ref={localVideoRef} autoPlay muted className="host-video absolute h-[15rem] w-[auto] bottom-[10vh] left-16"></video> : <></>}
                    <div className="users flex flex-wrap gap-4" style={{paddingInline: "1rem"}}>
                        {videos.map((video) => (
                            <div key={video.socketId} className="ind-user">
                                <video
                                    className="ind-user-video h-[17rem]" 
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    muted
                                >
                                </video>
                            </div>
                        ))}
                    </div>
                <div className="absolute bottom-0 w-[100vw] buttons-container flex flex-row justify-center">
                    <IconButton onClick={handleVideo}>
                        { video === true ? <VideocamIcon/> : <VideocamOffIcon/> }
                    </IconButton>
                    <IconButton>
                         <CallEndIcon onClick={handleEndCall} style={{color:"red"}}/>
                    </IconButton>
                    <IconButton onClick={handleAudio}>
                        { audio === true ? <MicIcon/> : <MicOffIcon/> }
                    </IconButton>
                    { video ?
                    <IconButton onClick={handleScreen}>
                        { screen === true ? <ScreenShareIcon/> : <StopScreenShareIcon/> }
                    </IconButton> :<></>
                    }
                    <Badge badgeContent={newMessages} color="primary">
                      <IconButton onClick={() => setModal(!showModal)}>
                         <ChatIcon/>
                      </IconButton>
                    </Badge>
                </div>

            </div>
            }
        </div>
    )
 }