import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'https://contenthub-static.grammarly.com/blog/wp-content/uploads/2017/11/how-to-write-a-blog-post.jpeg'
    },
    category: {
        type: String,
        default: 'uncategorized'
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
        default: []
    },
    numberOfLikes: {
        type: Number,
        default: 0
    },
    saves: {
        type: Array,
        default: []
    }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

export default Post;
