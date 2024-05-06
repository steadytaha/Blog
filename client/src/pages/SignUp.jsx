import { Button, Label, TextInput } from 'flowbite-react'
import React from 'react'
import { Link } from 'react-router-dom'

export default function SignUp() {
  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* Left Side */}
        <div className='flex-1'>
          <Link to="/" className='font-bold dark:text-white text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r rounded-lg from-green-400 to-blue-700 text-white'>Little's</span>
            Blog
          </Link>
          <p className='text-sm mt-5'>
            This is a demo project. You can sign up with your email 
            and password or with Google.</p>
        </div>
        {/* Right Side */}
        <div className='flex-1'>
          <form className='flex flex-col gap-4'>
            <div>
              <Label value='Your Username' />
              <TextInput type='text' placeholder='username' id='username' />
            </div>
            <div>
              <Label value='Your Email' />
              <TextInput type='text' placeholder='user@gmail.com' id='email' />
            </div>
            <div>
              <Label value='Your Password' />
              <TextInput type='text' placeholder='password' id='password' />
            </div>
            <Button gradientDuoTone='greenToBlue' type='submit'>
              Sign Up
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Already have an account?</span>
            <Link to='/signin' className='text-blue-500'> Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
};
