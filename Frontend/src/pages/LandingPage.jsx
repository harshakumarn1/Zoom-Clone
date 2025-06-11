import '../App.css'

export default function LandingPage() {
    return (
        <>
          <div className='LandingPage bg-[url("/src/assets/background.png")] bg-cover h-[100vh] w-[100vw]'>

            <nav className='flex justify-between'>
               <div className='logo text-white text-3xl font-semibold'>Agni  Video  Call</div>
               <div className='nav-list flex gap-4'>
                 <div className='text-white font-semibold'><a href="#" className='no-underline'>join as Guest</a></div>
                 <div className='text-white font-semibold'><a href="#" className='no-underline'>Register</a></div>
                 <div className='text-white font-semibold'><a href="#" className='no-underline'>Login</a></div>
               </div>
            </nav>

            <div className='landing-main w-[100%] flex flex-row items-center'>

               <div className='text-white'>
                 <div>
                   <span className='text-orange-400 text-5xl font-semibold'>Connect </span> 
                   <span className='text-5xl font-semibold'>with your Loved Ones</span> <br />
                 </div>
                 <div className='text-3xl font-semibold'>cover a Distance by Agni Video call</div>
                 <div role='button' className='text-white text-center px-4 text-2xl bg-orange-400 h-12 w-36 rounded'>
                   <a href="#">Get started</a>
                 </div>     
               </div>

               <div>
                 <img src="/src/assets/mobile.png" className='mobiles-pic h-[30rem]'/>
               </div>

            </div>

          </div>
        </>
    )
}