import { Link } from 'react-router-dom';
import { BsToggle2On } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import CallToAction from '../components/CallToAction';

export default function Projects() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const theme = useSelector((state) => state.theme.theme);

  return (
    <div className='min-h-screen max-w-5xl mx-auto flex justify-center items-center flex-col gap-6 p-3 relative'>
      {/* Switch to Modern Version Toggle */}
      {currentUser && currentUser.isAdmin && (
        <div className="absolute top-8 left-8 z-20">
          <Link 
            to="/modern-projects" 
            className={`flex items-center gap-3 px-6 py-3 border rounded-full transition-all duration-300 group ${
              theme === 'dark' 
                ? 'bg-gray-900 hover:bg-gray-800 border-gray-700' 
                : 'bg-white hover:bg-gray-50 border-gray-300 shadow-lg'
            }`}
          >
            <span className={`text-sm font-light group-hover:opacity-100 transition-opacity duration-300 ${
              theme === 'dark' 
                ? 'text-gray-300 group-hover:text-white' 
                : 'text-gray-600 group-hover:text-gray-900'
            }`}>
              Switch to Modern
            </span>
            <BsToggle2On className={`text-xl transition-colors duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 group-hover:text-white' 
                : 'text-gray-500 group-hover:text-gray-900'
            }`} />
          </Link>
        </div>
      )}

      <h1 className='text-3xl font-semibold'>Projects</h1>
      <p className='text-md text-gray-700 dark:text-white'>You can find my latest projects through my Github!</p>
      <CallToAction />
    </div>
  )
}