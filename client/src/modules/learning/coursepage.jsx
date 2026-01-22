import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  Clock,
  BarChart,
  Layers,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Edit,
  User,
  Star,
  Tag,
  Lock,
  LogIn,
} from "lucide-react";
import { getCourse } from "../../services/course.service";
import { checkEnrollment, enrollInCourse } from "../../services/enrollment.service";
import { useAuth } from "../../context/AuthContext";
import CourseEditModal from "../../components/common/CourseEditModal";

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Fetch course and enrollment status
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const courseData = await getCourse(id);
        if (courseData) {
          setCourse(courseData);

          // Check enrollment if user is logged in
          if (token && !isAdmin) {
            const enrollmentData = await checkEnrollment(id, token);
            setIsEnrolled(enrollmentData.enrolled);
          }
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, token, isAdmin]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/course/${id}` } });
      return;
    }

    // Always redirect to payment page
    navigate(`/payment/${id}`);
  };

  // Handle course update from modal
  const handleCourseSave = (updatedCourse) => {
    setCourse(updatedCourse);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-gray-600">
        <p className="text-xl mb-4">{error || 'Course not found'}</p>
        <button
          onClick={() => navigate('/learning')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          <ArrowLeft size={18} /> Back to Courses
        </button>
      </div>
    );
  }

  // Access control: Admin always has access, others need enrollment
  const hasAccess = isAdmin || isEnrolled;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative">
        {course.thumbnail ? (
          <div className="absolute inset-0 h-80">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 h-80 bg-gradient-to-r from-blue-600 to-indigo-600" />
        )}

        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-20">
          <button
            onClick={() => navigate('/learning')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={18} /> Back to Courses
          </button>

          {/* Admin Edit Button */}
          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg hover:bg-white/20 transition"
            >
              <Edit size={16} /> Edit Course
            </button>
          )}

          <div className="flex-1 text-white">
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm font-medium">
                {course.level}
              </span>
              {!hasAccess && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium flex items-center gap-1">
                  <Lock size={12} /> Enrollment Required
                </span>
              )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">{course.title}</h1>

            <p className="mt-4 text-white/80 max-w-2xl text-lg leading-relaxed">
              {course.description}
            </p>

            {course.instructor && (
              <div className="flex items-center gap-2 mt-6 text-white/90">
                <User size={18} />
                <span>Instructor: <strong>{course.instructor}</strong></span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-6">
              <Stat icon={<Clock size={18} />} label={course.duration || 'Self-paced'} />
              <Stat icon={<BarChart size={18} />} label={course.level} />
              <Stat icon={<Star size={18} />} label={course.rating > 0 ? `${course.rating.toFixed(1)} Rating` : 'New Course'} />
            </div>

            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {course.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Video Player / Preview */}
          <div className="bg-slate-900 rounded-2xl h-[360px] flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
            {course.thumbnail && (
              <img src={course.thumbnail} alt="Preview" className="w-full h-full object-cover opacity-30" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              {hasAccess ? (
                <PlayCircle className="w-20 h-20 opacity-80 cursor-pointer hover:scale-110 transition-transform" />
              ) : (
                <div className="text-center">
                  <Lock className="w-16 h-16 opacity-60 mx-auto mb-4" />
                  <p className="text-white/60">Enroll to access course content</p>
                </div>
              )}
            </div>
            <span className="absolute bottom-4 right-4 text-xs bg-white/20 px-3 py-1 rounded-full">
              {hasAccess ? 'Start Learning' : 'Preview'}
            </span>
          </div>

          {/* What you'll learn */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-xl font-bold mb-6">What you'll learn</h2>
            <ul className="grid sm:grid-cols-2 gap-4 text-gray-700">
              <li className="flex items-start gap-3"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} /> Master the fundamentals</li>
              <li className="flex items-start gap-3"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} /> Build real-world projects</li>
              <li className="flex items-start gap-3"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} /> Industry best practices</li>
              <li className="flex items-start gap-3"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} /> Job-ready skills</li>
              <li className="flex items-start gap-3"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} /> Certificate of completion</li>
              <li className="flex items-start gap-3"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} /> Lifetime access</li>
            </ul>
          </div>

          {/* Course Content - Only visible to enrolled users or admin */}
          {hasAccess && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
              <h2 className="text-xl font-bold mb-6">Course Content</h2>
              <div className="space-y-3">
                {['Introduction & Setup', 'Core Concepts', 'Advanced Topics', 'Project Work', 'Final Assessment'].map((module, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 cursor-pointer transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {i + 1}
                      </div>
                      <span>{module}</span>
                    </div>
                    <CheckCircle className="w-5 h-5 text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== ENROLL CARD ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-24">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">Full lifetime access</p>

          {!user ? (
            <button
              onClick={() => navigate('/login', { state: { from: `/course/${id}` } })}
              className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-900 transition shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> Login to Enroll
            </button>
          ) : hasAccess ? (
            <button
              onClick={() => navigate(`/course/${id}/learn`)}
              className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition shadow-lg"
            >
              {isAdmin ? 'View as Admin' : 'Continue Learning'}
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enrolling ? <Loader2 className="animate-spin" size={20} /> : null}
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            30-day money-back guarantee
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Layers size={16} /> <span>Comprehensive curriculum</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} /> <span>{course.duration || 'Self-paced'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart size={16} /> <span>{course.level} level</span>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition font-medium"
              >
                <Edit size={16} /> Edit This Course
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Edit Modal */}
      <CourseEditModal
        course={course}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleCourseSave}
      />
    </div>
  );
};

const Stat = ({ icon, label }) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm">
    {icon}
    <span>{label}</span>
  </div>
);

export default CoursePage;
