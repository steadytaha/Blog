import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Modal, ModalHeader, ModalBody, Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postId, setPostId] = useState(null);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await fetch(`/post/posts?author=${currentUser._id}`);
        const data = await response.json();
        if (response.ok) {
          setUserPosts(data.posts);
          if (data.posts.length <= 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    if (currentUser.isAdmin) {
      getPosts();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(`/post/posts?author=${currentUser._id}&startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prevPosts) => [...prevPosts, ...data.posts]);
        if (data.posts.length <= 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/post/delete/${postId}/${currentUser._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUserPosts(userPosts.filter(post => post._id !== postId));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className='w-full overflow-x-auto md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table hoverable className='min-w-full shadow-md'>
            <TableHead>
              <TableHeadCell>Date Updated</TableHeadCell>
              <TableHeadCell>Post Image</TableHeadCell>
              <TableHeadCell>Post Title</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell>Delete</TableHeadCell>
              <TableHeadCell>Edit</TableHeadCell>
            </TableHead>
            <TableBody>
              {userPosts.map((post) => (
                <TableRow key={post._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <TableCell>{new Date(post.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link className='font-medium text-gray-900 dark:text-white' to={`/post/${post.slug}`}>
                      <img src={post.image} alt={post.title} className='w-20 h-10 bg-gray-500' />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    <span onClick={() => { setShowModal(true); setPostId(post._id); }} className='font-medium text-red-500 hover:underline cursor-pointer'>Delete</span>
                  </TableCell>
                  <TableCell>
                    <Link className='text-teal-500 hover:underline' to={`/post/edit/${post._id}`}>
                      <span>Edit</span>
                    </Link>
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
        <h2>No posts found!</h2>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mx-auto mb-5">Are you sure?</h1>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeletePost}>Yes, I'm sure</Button>
              <Button color='gray' onClick={() => setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
