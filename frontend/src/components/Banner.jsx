import React from 'react';
import banner from "../../public/Banner.webp";

function Banner() {
  return (
    <>
    <div className="max-w-screen-2x1 container mx-auto md:px-20 px-4 flex flex-col md:flex-row  ">
        <div className='w-full order-2 md:order-1 md:w-1/2 mt-12 md:mt-32'>
       <div className='space-y-12'>
       <h1 className='text-4xl font-bold'>Welcome to <span className='text-pink-500'>Project Review Platform</span>,  Your Ultimate Project Review Hub!</h1>
        <p className='text-xl '>
        At Project Review Platform, we believe in the power of feedback and collaboration to elevate projects to new heights.Join our community today to showcase your work, gain valuable insights, and contribute your expertise to help others succeed.
Let’s build, review, and grow together!
        </p>
       </div>
        </div>
        <div className='w-full order-1 md:w-1/2'>
        <img src={banner}  className='w-81 h-81'alt="" /></div>
    </div>
    </>
  )
}

export default Banner