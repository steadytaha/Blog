import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
import { HiAnnotation, HiArrowSmRight, HiChartPie, HiDocumentText, HiOutlineUserGroup, HiUser } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signOutSuccess } from '../redux/user/userSlice';
import { debug } from '../utils/debug';

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
            debug.error(data.message);
        }
        } catch (error) {
            debug.error(error.message);
        }
    }


  return (
    <Sidebar className='w-full md:w-56'>
        <SidebarItems>
            <SidebarItemGroup className='flex flex-col gap-0.5'>
                {currentUser && currentUser.isAdmin && (
                    <>
                        <Link to='/dashboard?tab=dash'>
                            <Sidebar.Item active={tab === 'dash' || !tab} icon={HiChartPie} as='div'>
                                Dashboard
                            </Sidebar.Item>
                        </Link>
                        <Link to='/dashboard?tab=users'>
                            <SidebarItem active={tab === 'users'} icon={HiOutlineUserGroup} as='div'>
                                Users
                            </SidebarItem>
                        </Link>
                    </>
                )}
                <Link to='/dashboard?tab=profile'>
                    <SidebarItem active={tab === 'profile'} icon={HiUser} label={currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : currentUser.isAdmin ? 'Admin' : 'User'} labelColor='dark' as='div'>
                        Profile
                    </SidebarItem>
                </Link>
                {(currentUser.isAdmin || currentUser.role === "writer") && (
                    <>
                        <Link to='/dashboard?tab=posts'>
                            <SidebarItem active={tab === 'posts'} icon={HiDocumentText} as='div'>
                                Posts
                            </SidebarItem>
                        </Link>
                        <Link to='/dashboard?tab=comments'>
                            <SidebarItem active={tab === 'comments'} icon={HiAnnotation} as='div'>
                                Comments
                            </SidebarItem>
                        </Link>
                    </>
                )}
                    <SidebarItem onClick={handleSignout} icon={HiArrowSmRight} className='cursor-pointer'>
                    Sign Out
                    </SidebarItem>
            </SidebarItemGroup>
        </SidebarItems>
    </Sidebar>
  )
}
