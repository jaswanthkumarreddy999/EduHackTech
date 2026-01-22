// src/modules/learning/learning.jsx
import React, { useState, useEffect } from "react";
import { Search, BookOpen, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* COURSE BANNER IMAGES */
const sliderImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
];

const categories = ["All", "Coding", "Aptitude", "Management", "Tools"];

const courses = [
  {
    id: 1,
    title: "Full Stack Web Development",
    category: "Coding",
    level: "Beginner",
    modules: 12,
    duration: "40 hrs",
    rating: 4.7,
    tag: "Popular",
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    category: "Coding",
    level: "Advanced",
    modules: 20,
    duration: "35 hrs",
    rating: 4.9,
    tag: "Top Rated",
  },
  {
    id: 3,
    title: "System Design",
    category: "Coding",
    level: "Intermediate",
    modules: 8,
    duration: "18 hrs",
    rating: 4.6,
    tag: "New",
  },
  {
    id: 4,
    title: "Aptitude for Placements",
    category: "Aptitude",
    level: "Beginner",
    modules: 10,
    duration: "15 hrs",
    rating: 4.5,
    tag: "Trending",
  },
];

const Learning = () => {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const placeholders = [
    "Search Full Stack...",
    "Search DSA Courses...",
    "Search Aptitude...",
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
      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              Upgrade Your Skills 🚀
            </h1>
            <p className="mt-4 text-blue-100 text-lg">
              Learn industry‑ready skills with real projects & mentorship.
            </p>

            <div className="mt-6 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={typedText}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/90 backdrop-blur
                text-gray-800 placeholder-gray-500 outline-none border border-white/40
                shadow-lg focus:ring-4 focus:ring-blue-300/40 transition-all"
              />
            </div>
          </div>

          {/* CAROUSEL */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl h-[260px]">
            <div
              className="flex h-full transition-transform duration-700"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {sliderImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
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

      {/* CATEGORY */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                active === cat
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white border hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* COURSES */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8">Available Courses</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-2xl transition relative"
            >
              <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                {c.tag}
              </span>

              <BookOpen className="text-blue-600" />

              <h3 className="mt-4 font-bold text-lg">{c.title}</h3>

              <p className="text-sm text-gray-500 mt-1">
                {c.level} • {c.modules} Modules
              </p>

              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {c.duration}
                </span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-400" /> {c.rating}
                </span>
              </div>

              <button
                onClick={() => navigate(`/course/${c.id}`)}
                className="mt-5 w-full py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-semibold"
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Learning;
