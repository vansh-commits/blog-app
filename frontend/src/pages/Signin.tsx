import React from 'react'
import Quote from '../components/Quote'
import { Auth } from '../components/Auth'

const Signin = () => {
  
  return (
    <div>
        <div className="grid lg:grid-cols-2 grid-cols-1">
            <div>
                <Auth type="signin" />
            </div>
            <div className="hidden lg:block">
                <Quote />
            </div>
        </div>
    </div>

)
  
}

export default Signin
