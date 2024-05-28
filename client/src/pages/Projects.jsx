import CallToAction from '../components/CallToAction';

export default function Projects() {
  return (
    <div className='min-h-screen max-w-5xl mx-auto flex justify-center items-center flex-col gap-6 p-3'>
      <h1 className='text-3xl font-semibold'>Projects</h1>
      <p className='text-md text-gray-700 dark:text-white'>You can find my latest projects through my Github!</p>
      <CallToAction />
    </div>
  )
}