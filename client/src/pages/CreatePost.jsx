import React from 'react'
import { Button, FileInput, Select, TextInput } from 'flowbite-react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function () {
  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <h1 className='text-center text-3xl my-7 font-semibold'>Create a post</h1>
        <form className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
                <TextInput type='text' placeholder='Title' required id='title' className='flex-1' />
                <Select>
                    <option value='uncategorized'>Select a category</option>
                    <option value='art'>Art</option>
                    <option value='books'>Books</option>
                    <option value='business'>Business</option>
                    <option value='education'>Education</option>
                    <option value='entertainment'>Entertainment</option>
                    <option value='fashion'>Fashion</option>
                    <option value='food'>Food</option>
                    <option value='gaming'>Gaming</option>
                    <option value='general'>General</option>
                    <option value='health'>Health</option>
                    <option value='lifestyle'>Lifestyle</option>
                    <option value='movies'>Movies</option>
                    <option value='music'>Music</option>
                    <option value='politics'>Politics</option>
                    <option value='science'>Science</option>
                    <option value='sports'>Sports</option>
                    <option value='technology'>Technology</option>
                    <option value='travel'>Travel</option>
                    <option value='other'>Other</option>
                </Select>
            </div>
            <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
                <FileInput type='file' id='image' accept='image/*' />
                <Button type='button' className='bg-teal-500 hover:bg-teal-600 text-white'>Upload image</Button>
            </div>
            <ReactQuill theme='snow' className='h-72 mb-12' placeholder='Write your post here...' required />
            <Button type='submit' className='bg-teal-500 hover:bg-teal-600 text-white'>Publish</Button>
        </form>
    </div>
  )
}
