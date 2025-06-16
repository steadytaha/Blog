import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  HiOutlineSparkles,
  HiOutlinePhoto,
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineEye,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
  HiChevronDown
} from 'react-icons/hi2';
import { BsToggle2Off } from 'react-icons/bs';
import ModernUserPanel from '../components/ModernUserPanel.jsx';
import app from '../firebase';

// Custom styles for ReactQuill
const quillStyles = `
  .modern-quill .ql-toolbar {
    border: none !important;
    border-bottom: 1px solid rgba(156, 163, 175, 0.2) !important;
    padding: 16px !important;
  }
  .modern-quill .ql-container {
    border: none !important;
    font-size: 16px !important;
    line-height: 1.6 !important;
  }
  .modern-quill .ql-editor {
    padding: 24px !important;
    min-height: 300px !important;
  }
  .modern-quill .ql-editor::before {
    font-style: normal !important;
    color: rgba(156, 163, 175, 0.7) !important;
  }
  .modern-quill .ql-toolbar .ql-formats {
    margin-right: 20px !important;
  }
  .modern-quill .ql-toolbar button {
    border-radius: 6px !important;
    margin: 2px !important;
  }
  .modern-quill .ql-toolbar button:hover {
    background-color: rgba(59, 130, 246, 0.1) !important;
  }
  .modern-quill .ql-toolbar button.ql-active {
    background-color: rgba(59, 130, 246, 0.2) !important;
    color: rgb(59, 130, 246) !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = quillStyles;
  document.head.appendChild(styleSheet);
}

export default function ModernCreatePost() {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(null);
  const [formData, setFormData] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();

  // Handle escape key to close preview and dropdown
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showPreview) {
          setShowPreview(false);
        }
        if (showCategoryDropdown) {
          setShowCategoryDropdown(false);
        }
      }
    };
    
    const handleClickOutside = (e) => {
      if (showCategoryDropdown && !e.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPreview, showCategoryDropdown]);

  const categories = [
    'Art', 'Books', 'Business', 'Education', 'Entertainment',
    'Fashion', 'Food', 'Gaming', 'General', 'Health', 'Lifestyle', 
    'Movies', 'Music', 'Politics', 'Science', 'Sports', 'Technology', 
    'Travel', 'Other'
  ];

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setImageUploadError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

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
          setFilePreview(null);
          setFormData((prevFormData) => ({ ...prevFormData, image: downloadURL }));
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(null);
    setIsPublishing(true);

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
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <ModernUserPanel />
      
      {/* Switch to Classic Version Toggle */}
      {currentUser && currentUser.isAdmin && (
        <div className="absolute top-8 left-8 z-20">
          <Link 
            to="/create-post" 
            className={`flex items-center gap-3 px-6 py-3 border rounded-full transition-all duration-300 group ${
              theme === 'dark' 
                ? 'bg-gray-900 hover:bg-gray-800 border-gray-700' 
                : 'bg-white hover:bg-gray-50 border-gray-300 shadow-lg'
            }`}
          >
            <span className={`text-sm font-light group-hover:opacity-100 transition-opacity duration-300 ${
              theme === 'dark' 
                ? 'text-gray-300 group-hover:text-white' 
                : 'text-gray-600 group-hover:text-gray-900'
            }`}>
              Switch to Classic
            </span>
            <BsToggle2Off className={`text-xl transition-colors duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 group-hover:text-white' 
                : 'text-gray-500 group-hover:text-gray-900'
            }`} />
          </Link>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 animate-pulse">
          <HiOutlineSparkles className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-500">
          <HiOutlineDocumentText className={`text-lg ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <div className="absolute bottom-32 left-16 animate-pulse delay-1000">
          <HiOutlinePhoto className={`text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-700">
          <HiOutlineTag className={`text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
            theme === 'dark' 
              ? 'from-white via-gray-300 to-gray-500' 
              : 'from-gray-900 via-gray-700 to-gray-500'
          }`}>
            CREATE
          </h1>
          <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Share your thoughts, ideas, and stories with the world.
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/modern-search"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-900/5'
            }`}
          >
            <HiOutlineArrowLeft className="text-lg" />
            <span>Back to Posts</span>
          </Link>
        </div>

        {/* Create Post Form */}
        <div className={`rounded-3xl border backdrop-blur-sm p-8 md:p-12 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title and Category Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Title Input */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Post Title
                </label>
                <input
                  type="text"
                  placeholder="Enter your post title..."
                  required
                  className={`w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Category Select */}
              <div className="category-dropdown relative">
                <label className={`block text-sm font-semibold mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className={`w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 flex items-center justify-between ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20 hover:bg-gray-700' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 hover:bg-gray-50'
                    } ${formData.category ? '' : 'text-opacity-60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <HiOutlineTag className={`text-lg ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span>{formData.category || 'Select a category'}</span>
                    </div>
                    <HiChevronDown className={`text-lg transition-transform duration-300 ${
                      showCategoryDropdown ? 'transform rotate-180' : ''
                    } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showCategoryDropdown && (
                    <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border backdrop-blur-sm z-20 shadow-xl max-h-64 overflow-y-auto ${
                      theme === 'dark' 
                        ? 'bg-gray-800/95 border-gray-600' 
                        : 'bg-white/95 border-gray-200'
                    }`}>
                      <div className="p-2">
                        {categories.map((category, index) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: category });
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between group ${
                              formData.category === category
                                ? theme === 'dark'
                                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400'
                                  : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                                : theme === 'dark'
                                  ? 'text-gray-300 hover:bg-gray-700/50'
                                  : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-medium">{category}</span>
                            {formData.category === category && (
                              <HiOutlineCheckCircle className={`text-lg ${
                                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className={`block text-sm font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Featured Image
              </label>
              
              {!formData.image && !filePreview ? (
                <div className={`relative group cursor-pointer transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800/50' 
                    : 'hover:bg-gray-50/50'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group-hover:border-blue-500 ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gradient-to-br from-gray-800/30 to-gray-900/30' 
                      : 'border-gray-300 bg-gradient-to-br from-gray-50/50 to-white/50'
                  }`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 transition-all duration-300 group-hover:scale-110 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:from-blue-600/30 group-hover:to-purple-600/30' 
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200'
                    }`}>
                      <HiOutlinePhoto className={`text-3xl transition-colors duration-300 ${
                        theme === 'dark' ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'
                      }`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-200 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'
                    }`}>
                      Drop your image here
                    </h3>
                    <p className={`text-sm mb-6 transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
                    }`}>
                      or click to browse files
                    </p>
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-white' 
                        : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300 group-hover:text-gray-900'
                    }`}>
                      <HiOutlineCloudArrowUp className="text-lg" />
                      <span>Choose File</span>
                    </div>
                    <p className={`text-xs mt-4 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Supports: JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              ) : filePreview && !formData.image ? (
                <div className="space-y-4">
                  <div className={`relative rounded-3xl overflow-hidden border-2 ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <img 
                      src={filePreview} 
                      alt="Selected file preview" 
                      className="w-full h-80 object-cover" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent`}></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <p className="text-sm font-medium">Selected Image</p>
                          <p className="text-xs opacity-75">{file?.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setFilePreview(null);
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-300"
                          >
                            <HiOutlineTrash className="text-lg" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => handleFileSelect(e.target.files[0]);
                              input.click();
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-300"
                          >
                            <HiOutlinePhoto className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`relative rounded-3xl overflow-hidden border-2 ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-full h-80 object-cover" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent`}></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <p className="text-sm font-medium">Featured Image</p>
                          <p className="text-xs opacity-75">Ready to publish</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: null });
                            setFile(null);
                            setFilePreview(null);
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-300"
                        >
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button (when file selected but not uploaded) */}
              {filePreview && !formData.image && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={imageUploadProgress}
                    className={`px-8 py-4 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
                      imageUploadProgress
                        ? 'opacity-50 cursor-not-allowed bg-gray-400'
                        : theme === 'dark' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {imageUploadProgress ? (
                      <>
                        <div className="w-6 h-6">
                          <CircularProgressbar 
                            value={imageUploadProgress} 
                            text={`${imageUploadProgress}%`}
                            styles={{
                              text: { fontSize: '20px', fill: 'white', fontWeight: 'bold' },
                              path: { stroke: 'white', strokeWidth: 8 },
                              trail: { stroke: 'rgba(255,255,255,0.2)' }
                            }}
                          />
                        </div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCloudArrowUp className="text-xl" />
                        <span>Upload to Cloud</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Image Upload Error */}
              {imageUploadError && (
                <div className={`mt-4 p-4 rounded-2xl border backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-red-900/20 border-red-700/50 text-red-400' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <HiOutlineExclamationTriangle className="text-lg flex-shrink-0" />
                    <span>{imageUploadError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <label className={`block text-sm font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Content
              </label>
              <div className={`rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 focus-within:border-blue-500' 
                  : 'bg-white/50 border-gray-200 focus-within:border-blue-500'
              }`}>
                <div className={`px-6 py-4 border-b ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20' 
                        : 'bg-gradient-to-br from-emerald-100 to-teal-100'
                    }`}>
                      <HiOutlineDocumentText className={`text-lg ${
                        theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Write your story
                      </h3>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Use the rich text editor to format your content
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <ReactQuill
                    theme="snow"
                    className="modern-quill h-96"
                    placeholder="Start writing your amazing content here..."
                    required
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'blockquote', 'code-block'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header', 'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet', 'color', 'background',
                      'link', 'blockquote', 'code-block'
                    ]}
                  />
                </div>
              </div>
              <div className={`mt-3 flex items-center justify-between text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <span>💡 Tip: Use headings and formatting to make your content more readable</span>
                <span className={`px-2 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  Rich Text Editor
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-6 pt-8">
              <div className={`h-px bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-transparent via-gray-700 to-transparent' 
                  : 'from-transparent via-gray-300 to-transparent'
              }`}></div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={!formData.title || !formData.content}
                  className={`group px-8 py-4 border-2 font-bold text-lg tracking-wide rounded-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden ${
                    !formData.title || !formData.content
                      ? 'opacity-50 cursor-not-allowed border-gray-400 text-gray-400'
                      : theme === 'dark' 
                        ? 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400' 
                        : 'border-gray-400 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                  }`}
                >
                  {(!formData.title || !formData.content) ? null : (
                    <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      theme === 'dark' 
                        ? 'from-blue-600 to-purple-600' 
                        : 'from-blue-500 to-purple-500'
                    }`}></div>
                  )}
                  <div className="relative flex items-center justify-center gap-3">
                    <HiOutlineEye className="text-xl" />
                    <span>Preview</span>
                  </div>
                </button>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`group flex-1 px-8 py-4 font-bold text-lg tracking-wide rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden ${
                    isPublishing
                      ? 'opacity-50 cursor-not-allowed bg-gray-400'
                      : theme === 'dark' 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-2xl' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-2xl'
                  }`}
                >
                  {!isPublishing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  )}
                  <div className="relative flex items-center gap-3">
                    {isPublishing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineSparkles className="text-xl" />
                        <span>PUBLISH POST</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              <div className={`text-center text-sm ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <p>✨ Your post will be published immediately and visible to all readers</p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {publishError && (
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-red-900/20 border-red-700/50 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center gap-3">
                  <HiOutlineExclamationTriangle className="text-lg flex-shrink-0" />
                  <span>{publishError}</span>
                </div>
              </div>
            )}

            {publishSuccess && (
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-emerald-900/20 border-emerald-700/50 text-emerald-400' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <div className="flex items-center gap-3">
                  <HiOutlineCheckCircle className="text-lg flex-shrink-0" />
                  <span>{publishSuccess}</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-3xl border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20' 
                    : 'bg-gradient-to-br from-blue-100 to-purple-100'
                }`}>
                  <HiOutlineEye className={`text-lg ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Post Preview
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    How your post will appear to readers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className={`p-2 rounded-xl transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-8">
                {/* Post Header */}
                <div className="mb-8">
                  {formData.image && (
                    <div className="mb-6">
                      <img 
                        src={formData.image} 
                        alt={formData.title || 'Post preview'} 
                        className="w-full h-64 object-cover rounded-2xl"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    {formData.category && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {formData.category}
                      </span>
                    )}
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>

                  <h1 className={`text-4xl font-bold mb-4 leading-tight ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formData.title || 'Your Post Title'}
                  </h1>

                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                    }`}>
                      <img
                        src={currentUser?.photo || '/default-avatar.png'}
                        alt={currentUser?.username || 'Author'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {currentUser?.username || 'Your Name'}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {currentUser?.role === 'writer' ? 'Writer' : currentUser?.isAdmin ? 'Admin' : 'Author'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className={`prose prose-lg max-w-none ${
                  theme === 'dark' 
                    ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400' 
                    : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600'
                }`}>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formData.content || '<p>Your post content will appear here...</p>' 
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${
              theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This is how your post will look to readers
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-6 py-2 rounded-xl font-medium transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    // Focus on the publish button
                    setTimeout(() => {
                      const publishBtn = document.querySelector('button[type="submit"]');
                      if (publishBtn) publishBtn.focus();
                    }, 100);
                  }}
                  className={`px-6 py-2 rounded-xl font-medium transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                  }`}
                >
                  Looks Good, Publish!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 