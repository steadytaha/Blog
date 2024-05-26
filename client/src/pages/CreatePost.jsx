import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import app from '../firebase';

export default function CreatePost() {
    const [file, setFile] = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [publishError, setPublishError] = useState(null);
    const [publishSuccess, setPublishSuccess] = useState(null);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const handleUploadImage = async () => {
        if (!file) {
            setImageUploadError('Please select an image to upload');
            return;
        }
        setImageUploadError(null);

        const storage = getStorage(app);
        const fileName = `${new Date().getTime()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageUploadProgress(progress.toFixed(0));
            },
            (error) => {
                setImageUploadError('Image upload failed');
                setImageUploadProgress(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageUploadProgress(null);
                    setImageUploadError(null);
                    setFormData((prevFormData) => ({ ...prevFormData, image: downloadURL }));
                });
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPublishError(null);
        setPublishSuccess(null);

        try {
            const res = await fetch('/post/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                setPublishError(data.message);
            } else {
                setPublishSuccess('Post created successfully!');
                setTimeout(() => navigate(`/post/${data.slug}`), 2000);
            }
        } catch (error) {
            setPublishError('Post creation failed');
        }
    };

    return (
        <div className="p-3 max-w-3xl mx-auto min-h-screen">
            <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 sm:flex-row justify-between">
                    <TextInput
                        type="text"
                        placeholder="Title"
                        required
                        id="title"
                        className="flex-1"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <Select
                        required
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="">Select a category</option>
                        <option value="art">Art</option>
                        <option value="books">Books</option>
                        <option value="business">Business</option>
                        <option value="education">Education</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="fashion">Fashion</option>
                        <option value="food">Food</option>
                        <option value="gaming">Gaming</option>
                        <option value="general">General</option>
                        <option value="health">Health</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="movies">Movies</option>
                        <option value="music">Music</option>
                        <option value="politics">Politics</option>
                        <option value="science">Science</option>
                        <option value="sports">Sports</option>
                        <option value="technology">Technology</option>
                        <option value="travel">Travel</option>
                        <option value="other">Other</option>
                    </Select>
                </div>
                <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
                    <FileInput
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <Button
                        type="button"
                        className="bg-teal-500 hover:bg-teal-600 text-white"
                        onClick={handleUploadImage}
                        disabled={imageUploadProgress}
                    >
                        {imageUploadProgress ? (
                            <div className="w-12 h-12">
                                <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress || 0}%`} />
                            </div>
                        ) : (
                            'Upload image'
                        )}
                    </Button>
                </div>
                {imageUploadError && <Alert color="failure" type="error">{imageUploadError}</Alert>}
                {formData.image && (
                    <img src={formData.image} alt="preview" className="w-full h-72 object-cover" />
                )}
                <ReactQuill
                    theme="snow"
                    className="h-72 mb-12"
                    placeholder="Write your post here..."
                    required
                    onChange={(value) => setFormData({ ...formData, content: value })}
                />
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white">Publish</Button>
                {publishError && <Alert className="mt-5" color="failure" type="error">{publishError}</Alert>}
                {publishSuccess && <Alert className="mt-5" color="success" type="success">{publishSuccess}</Alert>}
            </form>
        </div>
    );
}
