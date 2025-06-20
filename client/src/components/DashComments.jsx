import { Modal, Table, Button, ModalHeader, ModalBody } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { debug } from '../utils/debug';

export default function DashComments() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');
  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (currentUser.isAdmin) {
          const res = await fetch('/comment/getComments');
          const data = await res.json();
          if (res.ok) {
            setComments(data.comments);
            if (data.comments.length < 9) {
              setShowMore(false);
            }
          }
        } else if (currentUser.role === 'writer') {
          const postsRes = await fetch(`/post/posts?author=${currentUser._id}`);
          const postData = await postsRes.json();
          debug.log(postData);
          if (postsRes.ok) {
            const commentsPromises = postData.posts.map((post) =>
              fetch(`/comment/getPostComments/${post._id}`).then((res) => res.json())
            );
            debug.log(commentsPromises);
            const commentsData = await Promise.all(commentsPromises);
            const allComments = commentsData.flatMap((data) => data);
            setComments(allComments);
            if (allComments.length < 9) {
              setShowMore(false);
            }
          }
        }
      } catch (error) {
        debug.error(error.message);
      }
    };

    if (currentUser.isAdmin || currentUser.role === 'writer') {
      fetchComments();
    }
  }, [currentUser.isAdmin, currentUser.role, currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      const res = await fetch(
        `/comment/getComments?startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, ...data.comments]);
        if (data.comments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/comment/deleteComment/${commentIdToDelete}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToDelete)
        );
        setShowModal(false);
      } else {
        debug.error(data.message);
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {(currentUser.isAdmin || currentUser.role === "writer") && comments.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Comment content</Table.HeadCell>
              <Table.HeadCell>Number of likes</Table.HeadCell>
              <Table.HeadCell>PostId</Table.HeadCell>
              <Table.HeadCell>UserId</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {comments.map((comment) => (
              <Table.Body className='divide-y' key={comment._id}>
                <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell>
                    {new Date(comment.updatedAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{comment.content}</Table.Cell>
                  <Table.Cell>{comment.numberOfLikes}</Table.Cell>
                  <Table.Cell>{comment.postId}</Table.Cell>
                  <Table.Cell>{comment.userId}</Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setCommentIdToDelete(comment._id);
                      }}
                      className='font-medium text-red-500 hover:underline cursor-pointer'
                    >
                      Delete
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className='w-full text-teal-500 self-center text-sm py-7'
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no comments yet!</p>
      )}
      <Modal show={showModal} onClose={()=>setShowModal(false)} popup size='md'>
        <ModalHeader />
          <ModalBody>
            <div className="text-center">
              <HiOutlineExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mx-auto mb-5">Are you sure?</h1>
              <div className='flex justify-center gap-4'>
                <Button color='failure' onClick={()=>handleDeleteComment(commentIdToDelete)}>Yes, I'm sure</Button>
                <Button color='gray' className='' onClick={()=>setShowModal(false)}>No, cancel</Button>
              </div>
            </div>
          </ModalBody>
      </Modal>
    </div>
  );
}