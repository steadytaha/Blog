import { Button } from 'flowbite-react';

export default function CallToAction() {
  return (
    <div className='flex flex-col sm:flex-row p-3 border border-blue-700 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
        <div className="flex-1 justify-center flex flex-col">
            <h2 className='text-2xl'>
                Wanna be an author on our blog? Contact us!
            </h2>
            <p className='text-gray-600 my-2 dark:text-gray-400'>
                If you have an idea for an article, we'd love to hear from you!
            </p>
            <Button gradientDuoTone='purpleToBlue' className='rounded-tl-xl rounded-bl-none'>
                <a href="https://www.linkedin.com/in/tahaefegumus/" target='_blank' rel='noopener noreferrer'>
                    Click here to apply
                </a>
            </Button>
        </div>
        <div className="p-5">
            <img src="https://i.pinimg.com/564x/da/95/57/da9557ff5e5699b670d78cc5450f8c45.jpg" />
        </div>
    </div>
  )
}