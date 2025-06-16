import { Button, Spinner } from 'flowbite-react';
import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BsToggle2On } from 'react-icons/bs';
import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import { debug } from '../utils/debug';

export default function PostPage() {
  const { postId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [creator, setCreator] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);

  const fetchPostData = useCallback(async () => {
    try {
      setLoading(true);
      const postRes = await fetch(`/post/posts?slug=${postId}`);
      const recentPostsRes = await fetch(`/post/posts?limit=3`);
      
      if (!postRes.ok || !recentPostsRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const postData = await postRes.json();
      const recentPostsData = await recentPostsRes.json();
      
      if (postData.posts.length > 0) {
        setPost(postData.posts[0]);
      }
      setRecentPosts(recentPostsData.posts);
      
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  useEffect(() => {
    const fetchCreator = async () => {
      if (!post) return;
      try {
        const res = await fetch(`/user/${post.author}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setCreator(data);
      } catch (error) {
        debug.error(error.message);
      }
    };
    fetchCreator();
  }, [post]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Error loading post.</p>
      </div>
    );
  }

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen relative">
      {/* Switch to Modern Version Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Link 
          to={`/modern-post/${postId}`}
          className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full transition-all duration-300 group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg"
        >
          <span className="text-sm font-light text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
            Switch to Modern
          </span>
          <BsToggle2On className="text-xl text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300" />
        </Link>
      </div>
      
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      <Link to={`/modern-search?category=${post && post.category}`} className="self-center mt-5">
        <Button color="gray" pill size="xs">
          {post && post.category}
        </Button>
      </Link>
      <img
        src={post && post.image}
        alt={post && post.title}
        className="mt-10 p-3 max-h-[600px] w-full object-cover"
      />
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.updatedAt).toLocaleDateString()}</span>
        <span className="italic">{post && (post.content.length / 1000).toFixed(0)} mins read</span>
      </div>
      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>
      <div className="flex justify-end items-center p-3 border-t border-slate-500 mx-auto w-full max-w-2xl text-md mt-5">
        <div className="flex items-center space-x-2">
          <img
            src={creator.photo}
            alt={creator.username}
            className="w-8 h-8 rounded-full bg-gray-200"
          />
          <span className="font-medium">{creator.username}</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto w-full">
        <CallToAction />
      </div>
      <CommentSection postId={post._id} />

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts.map((recentPost) => (
            <PostCard key={recentPost._id} post={recentPost} />
          ))}
        </div>
      </div>
    </main>
  );
}
