import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineCodeBracket, HiOutlineGlobeAlt, HiOutlineFire, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { FaGithub, FaReact, FaNodeJs, FaPython, FaJs, FaDatabase, FaJava } from 'react-icons/fa';
import { SiTailwindcss, SiMongodb, SiExpress, SiFirebase, SiNextdotjs } from 'react-icons/si';

import { useSelector } from 'react-redux';
import ModernUserPanel from '../components/ModernUserPanel.jsx';

export default function ModernProjects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const featuredProjects = [
    {
      id: 1,
      title: "ChatWithPDF",
      description: "RAG with Mixtral 8x7B and ColBERT - Advanced AI-powered document analysis system for intelligent PDF interactions.",
      technologies: [FaPython],
      liveUrl: "#",
      githubUrl: "https://github.com/steadytaha/ChatWithPDF",
      status: "Live",
      featured: true,
      stars: 3
    },
    {
      id: 2,
      title: "Little's Blog",
      description: "Full-stack modern blog platform with user authentication, admin dashboard, and responsive design.",
      technologies: [FaJs, FaReact, FaNodeJs, SiMongodb, SiTailwindcss],
      liveUrl: "#",
      githubUrl: "https://github.com/steadytaha/Blog",
      status: "Live",
      featured: true
    },
    {
      id: 3,
      title: "ClimateCrisis",
      description: "Climate Crisis report analyzing gas emissions and temperature data for Turkey, Europe and USA using Python data science.",
      technologies: [FaPython],
      liveUrl: "#",
      githubUrl: "https://github.com/steadytaha/ClimateCrisis",
      status: "Live",
      featured: true
    },
    {
      id: 4,
      title: "LaptopVersus",
      description: "Product Comparison System built with Java for comparing laptop specifications and features.",
      technologies: [FaJava, FaDatabase],
      liveUrl: "#",
      githubUrl: "https://github.com/steadytaha/LaptopVersus",
      status: "Live",
      featured: false
    },
    {
      id: 5,
      title: "MIUUL ML Summer Camp",
      description: "Machine Learning exercises and solutions from Miuul Machine Learning Summer Camp '23 program.",
      technologies: [FaPython],
      liveUrl: "#",
      githubUrl: "https://github.com/steadytaha/MIUUL-ML-SUMMERCAMP",
      status: "Live",
      featured: false
    },
    {
      id: 6,
      title: "Notes-on-Web",
      description: "Web-based note-taking application built with Python for organizing and managing personal notes.",
      technologies: [FaPython],
      liveUrl: "#",
      githubUrl: "https://github.com/steadytaha/Notes-on-Web",
      status: "Live",
      featured: false
    }
  ];

  const getTechColor = (TechIcon) => {
    const techColors = {
      [FaReact]: 'text-blue-500',
      [SiTailwindcss]: 'text-cyan-500',
      [FaNodeJs]: 'text-green-500',
      [SiMongodb]: 'text-green-600',
      [SiExpress]: 'text-gray-600',
      [SiFirebase]: 'text-orange-500',
      [SiNextdotjs]: 'text-gray-900 dark:text-white',
      [FaJs]: 'text-yellow-500',
      [FaPython]: 'text-blue-600',
      [FaJava]: 'text-red-500',
      [FaDatabase]: 'text-purple-500'
    };
    return techColors[TechIcon] || 'text-gray-500';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'bg-green-500';
      case 'In Development': return 'bg-blue-500';
      case 'Beta': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`min-h-screen overflow-hidden modern-scrollbar transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Modern User Panel */}
      <ModernUserPanel />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Orbital Rings */}
        <div className="absolute top-1/3 right-1/4 transform">
          <div className={`w-64 h-64 border rounded-full animate-spin-slow opacity-20 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border rounded-full animate-spin-reverse opacity-30 ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-400'
          }`}></div>
        </div>

        {/* Code Pattern Background */}
        <div className="absolute top-1/2 left-1/4 opacity-5">
          <HiOutlineCodeBracket className="text-8xl animate-pulse" />
        </div>
        <div className="absolute bottom-1/4 right-1/3 opacity-5">
          <HiOutlineGlobeAlt className="text-6xl animate-pulse delay-1000" />
        </div>

        {/* Floating Stars */}
        <div className="absolute top-20 left-20 animate-pulse">
          <HiOutlineSparkles className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-500">
          <HiOutlineSparkles className={`text-lg ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <div className="absolute bottom-32 left-16 animate-pulse delay-1000">
          <HiOutlineSparkles className={`text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>

        {/* Parallax Cursor Follow */}
        <div 
          className={`absolute w-2 h-2 rounded-full opacity-20 transition-all duration-300 ease-out ${
            theme === 'dark' ? 'bg-white' : 'bg-gray-800'
          }`}
          style={{
            left: mousePosition.x * 0.05,
            top: mousePosition.y * 0.05,
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className={`modern-title text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
              theme === 'dark' 
                ? 'from-white via-gray-300 to-gray-500' 
                : 'from-gray-900 via-gray-700 to-gray-500'
            }`}>
              PROJECTS
            </h1>
            <p className={`text-xl max-w-2xl mx-auto mb-16 font-light leading-relaxed ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
            }`}>
              A collection of data science and development projects showcasing AI, machine learning,
              web development, and innovative problem-solving approaches.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20">
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-gray-800' 
                  : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <HiOutlineFire className="text-4xl mx-auto mb-4 text-orange-500" />
                <h3 className="text-3xl font-bold mb-2">32</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Total Repositories
                </p>
              </div>
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-gray-800' 
                  : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <HiOutlineCodeBracket className="text-4xl mx-auto mb-4 text-blue-500" />
                <h3 className="text-3xl font-bold mb-2">28</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  GitHub Stars
                </p>
              </div>
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-gray-800' 
                  : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <FaGithub className="text-4xl mx-auto mb-4 text-purple-500" />
                <h3 className="text-3xl font-bold mb-2">4</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Followers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Featured Projects
            </h2>
            <p className={`text-center mb-16 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Highlighting some of my most impactful and innovative work
            </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
              {featuredProjects.filter(project => project.featured).map((project, index) => (
                <div 
                  key={project.id}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-900 border-gray-800 hover:border-gray-600' 
                      : 'bg-white border-gray-200 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      {project.stars && (
                        <div className="flex items-center gap-1">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {project.stars}
                          </span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      )}
                    </div>

                    <h3 className={`text-2xl font-bold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {project.title}
                    </h3>
                    
                    <p className={`mb-6 leading-relaxed ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {project.technologies.map((TechIcon, techIndex) => (
                        <div 
                          key={techIndex}
                          className={`p-2 rounded-lg border transition-colors duration-300 ${
                            theme === 'dark' 
                              ? 'border-gray-700 hover:border-gray-600' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <TechIcon className={`text-xl ${getTechColor(TechIcon)}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${
                    theme === 'dark' 
                      ? 'from-blue-500 to-purple-600' 
                      : 'from-blue-400 to-purple-500'
                  }`}></div>
                </div>
              ))}
            </div>

            {/* All Projects Grid */}
            <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              All Projects
            </h2>
            <p className={`text-center mb-16 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Explore the complete collection of my development work
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <div 
                  key={project.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-900 border-gray-800 hover:border-gray-600' 
                      : 'bg-white border-gray-200 shadow-md hover:shadow-xl'
                  }`}
                >
                  <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded-full transition-colors duration-300 ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-800 text-gray-500 hover:text-white' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <FaGithub className="text-lg" />
                      </a>
                    </div>

                    <h3 className={`text-lg font-bold mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {project.title}
                    </h3>
                    
                    <p className={`text-sm mb-4 leading-relaxed ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((TechIcon, techIndex) => (
                        <div 
                          key={techIndex}
                          className={`p-1.5 rounded-md border ${
                            theme === 'dark' 
                              ? 'border-gray-700' 
                              : 'border-gray-200'
                          }`}
                        >
                          <TechIcon className={`text-sm ${getTechColor(TechIcon)}`} />
                        </div>
                      ))}
                      {project.technologies.length > 4 && (
                        <div className={`p-1.5 text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          +{project.technologies.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-20">
              <div className={`relative overflow-hidden rounded-3xl p-12 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                  : 'bg-gradient-to-br from-gray-100 via-white to-gray-50'
              }`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 left-4">
                    <HiOutlineCodeBracket className="text-6xl" />
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <HiOutlineSparkles className="text-8xl" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <FaGithub className="text-12xl" />
                  </div>
                </div>
                
                <div className="relative z-10 text-center max-w-3xl mx-auto">
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border border-gray-700' 
                        : 'bg-white border border-gray-200 shadow-lg'
                    }`}>
                      <FaGithub className="text-3xl text-purple-500" />
                    </div>
                  </div>
                  
                  <h3 className={`text-3xl font-bold mb-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Explore More on GitHub
                  </h3>
                  
                  <p className={`text-lg mb-8 leading-relaxed ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Dive deeper into my code, contribute to open source projects, and discover
                    the full range of my development journey including data science experiments,
                    web applications, and machine learning implementations.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                      href="https://github.com/steadytaha"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-105 ${
                        theme === 'dark' 
                          ? 'bg-white text-black hover:bg-gray-100' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      <FaGithub className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                      Visit GitHub Profile
                    </a>
                    
                    <div className={`flex items-center gap-6 px-6 py-3 rounded-2xl border ${
                      theme === 'dark' 
                        ? 'border-gray-700 bg-gray-800/50' 
                        : 'border-gray-300 bg-white/50'
                    }`}>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          32
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Repos
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          4
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Followers
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          28
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Stars
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-20 mb-20">
              <Link
                to="/"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-900/5'
                }`}
              >
                <span>← Back to Home</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 