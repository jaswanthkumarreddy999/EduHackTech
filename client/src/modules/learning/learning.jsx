import React, { useState, useEffect } from "react";
import { Search, BookOpen, Star, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../../services/course.service";

/* ✅ COURSE BANNER IMAGES (CAROUSEL) */
const sliderImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
];

// Fallback dummy course for cross-checking
const FALLBACK_COURSES = [
  {
    _id: 'dummy-1',
    title: "Full Stack Web Development (Demo)",
    category: "Web Development",
    level: "Beginner",
    duration: "40 hrs",
    rating: 4.7,
    tags: ["React", "Node.js", "MongoDB"],
    status: "published",
    description: "This is a demo course to verify the integration works."
  },
];

// Helper: Map backend data to display format
const mapCourseData = (course) => ({
  id: course._id,
  title: course.title,
  category: course.category || "Other",
  level: course.level || "Beginner",
  duration: course.duration || "N/A",
  rating: course.rating || 0,
  tags: course.tags || [],
  thumbnail: course.thumbnail || null,
  instructor: course.instructor || null,
  description: course.description,
});

const Learning = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  // Categories derived from backend data + static ones
  const categories = ["All", "Web Development", "Mobile Development", "Data Science", "AI/ML", "DevOps", "Other"];

  /* ===== FETCH COURSES FROM BACKEND ===== */
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await getCourses();
        if (data && data.length > 0) {
          setCourses(data.map(mapCourseData));
        } else {
          // Use fallback if no courses from backend
          setCourses(FALLBACK_COURSES.map(mapCourseData));
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses(FALLBACK_COURSES.map(mapCourseData));
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  /* ===== IMAGE CAROUSEL ===== */
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  /* ===== ANIMATED PLACEHOLDER ===== */
  const placeholders = [
    "Search Full Stack...",
    "Search DSA Courses...",
    "Search AI/ML...",
    "Search Interview Skills...",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let charIndex = 0;
    const current = placeholders[placeholderIndex];

    const typing = setInterval(() => {
      setTypedText(current.slice(0, charIndex + 1));
      charIndex++;

      if (charIndex === current.length) {
        clearInterval(typing);
        setTimeout(() => {
          setTypedText("");
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 1400);
      }
    }, 80);

    return () => clearInterval(typing);
  }, [placeholderIndex]);

  const filtered = courses.filter(
    (c) =>
      (active === "All" || c.category === active) &&
      c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ===== HERO WITH IMAGE CAROUSEL ===== */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          {/* TEXT SIDE */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              Upgrade Your Skills 🚀
            </h1>
            <p className="mt-4 text-blue-100 text-lg">
              Learn industry‑ready skills and compete in real hackathons.
            </p>

            {/* ✅ ANIMATED SEARCH BAR */}
            <div className="mt-6 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={typedText}
                className="w-full pl-12 pr-4 py-3 rounded-full 
                bg-white/90 backdrop-blur 
                text-gray-800 placeholder-gray-500
                outline-none border border-white/40
                shadow-lg
                focus:ring-4 focus:ring-blue-300/40
                transition-all duration-300"
              />
            </div>
          </div>

          {/* IMAGE CAROUSEL */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl h-[260px]">
            <div
              className="flex h-full transition-transform duration-700"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {sliderImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="course"
                  className="min-w-full h-full object-cover"
                />
              ))}
            </div>

            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-4 left-4 text-sm font-semibold">
              Featured Learning Tracks
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY FILTER ===== */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-6 py-2 rounded-full font-semibold transition ${active === cat
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white border hover:bg-gray-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ===== COURSE GRID ===== */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8">Recommended Courses</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No courses found.</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/course/${c.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Course Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <BookOpen className="text-white/60" size={48} />
                    </div>
                  )}
                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-white/90 text-blue-700 font-semibold shadow">
                    {c.category}
                  </span>
                  {/* Level Badge */}
                  <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-black/50 text-white font-medium">
                    {c.level}
                  </span>
                </div>

                {/* Course Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {c.title}
                  </h3>

                  {c.instructor && (
                    <p className="text-sm text-gray-500 mt-1">by {c.instructor}</p>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {c.duration || 'Self-paced'}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {c.rating > 0 ? c.rating.toFixed(1) : 'New'}
                    </span>
                  </div>

                  {/* Tags */}
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {c.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-semibold text-sm"
                  >
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Learning;
