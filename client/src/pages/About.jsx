export default function About() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-2xl mx-auto p-2 text-center'>
        <div>
          <h1 className='text-3xl font font-semibold text-center my-7'>
            About Little's Blog
          </h1>
          <div className='text-md text-gray-700 flex flex-col gap-6 dark:text-yellow-100'>
            <p>
              Welcome to Litttle's Blog! This blog was created by Taha Efe Gümüş
              as a personal project to share his thoughts and ideas with the
              world, also for the advanced web development class. Efe is 
              a passionate developer who loves to write about technology, 
              coding, and everything in between.
            </p>

            <p>
              On this blog, you'll find weekly articles on topics
              such as development, software engineering, sports, lifestyle,
              and more. Efe will share his knowledge and experience with you
              through guides, tutorials, and reviews of the latest, 
              so be sure to check back often for new content!

            </p>

            <p>
              We encourage you to leave comments on our posts and engage with
              other readers. You can like other people's comments and reply to
              them as well. We believe that a community of learners can help
              each other grow and improve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}