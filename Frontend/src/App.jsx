import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Authentication from './pages/Authentication.jsx'
import { AuthProvider } from './contexts/Authcontext.jsx'
import VideoMeet from './pages/videoMeet.jsx'
import Home from './pages/Home.jsx'



function App() {

  return (
    <>
      <Router>

        <AuthProvider>

         <Routes>
             <Route path='/' element={<LandingPage/>} />
             <Route path='/auth' element={<Authentication/>} />
             <Route path='/home' element={<Home/>} />
             <Route path='/:meetcode' element={<VideoMeet />} />
         </Routes>
          
        </AuthProvider>

      </Router>
    </>
  )
}

export default App
