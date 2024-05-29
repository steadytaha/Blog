import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Modal, ModalHeader, ModalBody, Button } from 'flowbite-react';
import { HiBan, HiCheck, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashUsers() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch(`/user/users`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
          if (data.users.length < 10) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    if (currentUser.isAdmin) {
      getUsers();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/user/users?startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUsers((prevPosts) => [...prevPosts, ...data.users]);
        if (data.users.length < 10) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching more users:', error);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/user/delete/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(user => user._id !== userId));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className='w-full overflow-x-auto md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <Table hoverable className='min-w-full shadow-md'>
            <TableHead>
              <TableHeadCell>Date Created</TableHeadCell>
              <TableHeadCell>User Image</TableHeadCell>
              <TableHeadCell>Username</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Admin</TableHeadCell>
              <TableHeadCell>Delete</TableHeadCell>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <img src={user.photo} alt={user.username} className='w-10 h-10 bg-gray-500 rounded-full' />
                  </TableCell>
                  <TableCell>
                    {user.username}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isAdmin ? (<HiCheck className='text-green-500 w-5 h-5'/>) : (<HiBan className='text-red-500 w-5 h-5'/>)}</TableCell>
                  <TableCell>
                    <span onClick={() => { setShowModal(true); setUserId(user._id); }} className='font-medium text-red-500 hover:underline cursor-pointer'>Delete</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {showMore && (
            <button className='w-full text-teal-500 self-center text-sm py-7' onClick={handleShowMore}>
              Show more
            </button>
          )}
        </>
      ) : (
        <h2>No users found!</h2>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mx-auto mb-5">Are you sure?</h1>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteUser}>Yes, I'm sure</Button>
              <Button color='gray' onClick={() => setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
