import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {

    const AuthComponent = (props) => {

        const routeTo = useNavigate()

        const isAuthenticated = () => {
            if(localStorage.getItem("token")){
                return true;
            } else return false;
        }

        useEffect(() => {
        if(!isAuthenticated()){
            routeTo('/auth')
        }
        },[])

        return <WrappedComponent {...props}/>
    }

    return AuthComponent;

}

export default withAuth