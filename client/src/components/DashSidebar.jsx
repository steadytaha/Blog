import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
import { HiArrowSmRight, HiDocumentText, HiUser } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signOutSuccess } from '../redux/user/userSlice';

export default function DashSidebar() {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.currentUser);
    const location = useLocation();
    const [tab, setTab] = useState('');
    useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

    const handleSignout = async () => {
        try {
        const res = await fetch('/user/signout', {
            method: 'POST',
        });
        const data = await res.json();
        if (res.ok) {
            dispatch(signOutSuccess());
        } else {
            console.log(data.message);
        }
        } catch (error) {
            console.log(error.message);
        }
    }


  return (
    <Sidebar className='w-full md:w-56'>
        <SidebarItems>
            <SidebarItemGroup className='flex flex-col gap-0.5'>
                <Link to='/dashboard?tab=profile'>
                    <SidebarItem active={tab === 'profile'} icon={HiUser} label={currentUser.isAdmin ? 'Admin' : 'User'} labelColor='dark' as='div'>
                        Profile
                    </SidebarItem>
                </Link>
                {currentUser.isAdmin && (
                    <Link to='/dashboard?tab=posts'>
                        <SidebarItem active={tab === 'posts'} icon={HiDocumentText} as='div'>
                            Posts
                        </SidebarItem>
                    </Link>
                )}
                    <SidebarItem onClick={handleSignout} icon={HiArrowSmRight} className='cursor-pointer'>
                    Sign Out
                    </SidebarItem>
            </SidebarItemGroup>
        </SidebarItems>
    </Sidebar>
  )
}
