import { Avatar, Button, Dropdown, DropdownDivider, DropdownHeader, DropdownItem, Navbar, TextInput } from 'flowbite-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AiOutlineSearch } from 'react-icons/ai'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react';
import { toggleTheme } from '../redux/theme/themeSlice.js'
import { signOutSuccess } from '../redux/user/userSlice.js'
import { debug } from '../utils/debug.js';


export default function Header() {
    const path = useLocation().pathname;
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = useSelector(state => state.user.currentUser);
    const theme = useSelector(state => state.theme.theme);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        if (searchTermFromUrl) {
          setSearchTerm(searchTermFromUrl);
        }
      }, [location.search]);

    useEffect(() => {
        setSearchTerm('');
    }, [location.pathname]);

    const handleSignout = async () => {
        try {
          const res = await fetch('/user/signout', {
            method: 'POST',
          });
          const data = await res.json();
          if (res.ok) {
            dispatch(signOutSuccess());
            setSearchTerm('');
          } else {
            debug.error(data.message);
          }
        } catch (error) {
          debug.error(error.message);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
        setSearchTerm('');
      };

  return (
    <Navbar className='border-b-2'>
        <Link to="/" className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'>
            <span className='px-2 py-1 bg-gradient-to-r rounded-lg from-green-400 to-blue-700 text-white'>Little's</span>
            Blog
        </Link>
        <form onSubmit={handleSubmit}>
        <TextInput
          type='text'
          placeholder='Search...'
          rightIcon={AiOutlineSearch}
          className='hidden lg:inline'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}/>
      </form>
        <Button className='w-12 h-10 lg:hidden' color='gray' pill>
            <AiOutlineSearch />
        </Button>
        <div className='flex gap-2 md:order-2'>
            <Button className='w-12 h-10 hidden sm:inline' color='gray' pill onClick={()=>dispatch(toggleTheme())}>
                {theme === 'light' ? <FaSun /> : <FaMoon />}
            </Button>
            {currentUser ? (
                <Dropdown 
                arrowIcon={false} 
                inline 
                label={
                    <Avatar
                        img={currentUser.photo}
                        alt={currentUser.username}
                        rounded 
                    />
                }>
                    <Dropdown.Header>
                        <span className='block text-sm'>@{currentUser.username}</span>
                        {/*<span className='block text-sm font-medium truncate'>{currentUser.email}</span>*/}
                        <Dropdown.Header>
                            <Link to='/dashboard?tab=profile'>
                                <Dropdown.Item>Profile</Dropdown.Item>
                            </Link>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
                        </Dropdown.Header>
                    </Dropdown.Header>
                </Dropdown>
            ) : (
                <Link to='/signin'>
                    <Button gradientDuoTone='greenToBlue' outline>
                        Sign In
                    </Button>
                </Link>
            )}
            <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
                <Navbar.Link active = {path === '/'} as = {'div'}>
                    <Link to='/'>
                        Home
                    </Link>
                </Navbar.Link>
                <Navbar.Link active = {path === '/about'} as = {'div'}>
                    <Link to='/about'>
                        About
                    </Link>
                </Navbar.Link>
                <Navbar.Link active = {path === '/projects' || path === '/modern-projects'} as = {'div'}>
                    <Link to='/projects'>
                        Projects
                    </Link>
                </Navbar.Link>
            </Navbar.Collapse>
    </Navbar>
  )
}
