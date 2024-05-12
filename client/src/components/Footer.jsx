import React from 'react'
import { Footer } from 'flowbite-react'
import { Link } from 'react-router-dom'
import { BsLinkedin, BsGithub} from 'react-icons/bs'

export default function FooterCom() {
  return (
    <Footer container className='border border-t-8 border-teal-500'>
        <div className='w-full max-w-7xl mx-auto'>
            <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
                <div className='mt-5'>
                    <Link 
                        to="/" 
                        className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
                    >
                        <span className='px-2 py-1 bg-gradient-to-r rounded-lg from-green-400 to-blue-700 text-white'>
                            Little's
                        </span>
                        Blog
                    </Link>
                </div>
                <div className='grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6'>
                    <div>
                        <Footer.Title title='About' />
                        <Footer.LinkGroup col>
                            <Footer.Link 
                            href='https://github.com/steadytaha/ChatWithPDF' 
                            target='_blank' 
                            rel='noopener noreferrer'
                            >
                                Chat with PDF
                            </Footer.Link>
                            <Footer.Link 
                            href='https://steadytaha.github.io/MovieStar/' 
                            target='_blank' 
                            rel='noopener noreferrer'>
                                MovieStar
                            </Footer.Link>
                        </Footer.LinkGroup>
                    </div>
                    <div>
                        <Footer.Title title='Follow Me' />
                        <Footer.LinkGroup col>
                            <Footer.Link 
                            href='https://github.com/steadytaha' 
                            target='_blank' 
                            rel='noopener noreferrer'
                            >
                                Github
                            </Footer.Link>
                            <Footer.Link 
                            href='#'>
                                Discord
                            </Footer.Link>
                        </Footer.LinkGroup>
                    </div>
                    <div>
                        <Footer.Title title='Legal' />
                        <Footer.LinkGroup col>
                            <Footer.Link 
                            href='#'>
                                Privacy Policy
                            </Footer.Link>
                            <Footer.Link 
                            href='#'>
                                Terms &amp; Conditions
                            </Footer.Link>
                        </Footer.LinkGroup>
                    </div>
                </div>
            </div>
            <Footer.Divider />
            <div className='w-full sm:flex sm:items-center sm:justify-between'>
                <Footer.Copyright href='#' by="Little's Blog" year={new Date().getFullYear()}/>
                <div className='flex gap-6 sm:mt-0 mt-4 sm: justify-center'>
                    <Footer.Icon href='#' icon={BsLinkedin} />
                    <Footer.Icon href='#' icon={BsGithub} />
                </div>
            </div>
        </div>
    </Footer>
  );
}
