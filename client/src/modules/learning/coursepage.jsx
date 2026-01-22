import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlayCircle, Clock, BarChart, Layers, CheckCircle } from "lucide-react";

/*
  ⚠ In real app this comes from BACKEND
*/
const demoCourse = {
  id: 1,
  title: "Full Stack Web Development",
  description:
    "Learn to build complete web applications using React, Node.js, Express and MongoDB. This course takes you from beginner to job-ready developer.",
  level: "Beginner",
  duration: "40 Hours",
  modules: [
    "Introduction & Setup",
    "HTML, CSS & Git",
    "JavaScript Deep Dive",
    "React Fundamentals",
    "Backend with Node & Express",
    "MongoDB & Authentication",
    "Final Full Stack Project",
  ],
};

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enrolled, setEnrolled] = useState(false);
  const [completed, setCompleted] = useState([]);

  /* ✅ Scroll to top when page opens */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ✅ Load enrollment + progress */
  useEffect(() => {
    const e = localStorage.getItem(`enrolled_${id}`);
    const c = localStorage.getItem(`completed_${id}`);
    if (e) setEnrolled(true);
    if (c) setCompleted(JSON.parse(c));
  }, [id]);

  const toggleModule = (i) => {
    let updated;
    if (completed.includes(i)) {
      updated = completed.filter((x) => x !== i);
    } else {
      updated = [...completed, i];
    }
    setCompleted(updated);
    localStorage.setItem(`completed_${id}`, JSON.stringify(updated));
  };

  const progress = Math.round(
    (completed.length / demoCourse.modules.length) * 100,
  );

  const handleEnroll = () => {
    navigate(`/payment/${id}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ===== HERO ===== */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <h1 className="text-4xl font-extrabold">{demoCourse.title}</h1>
          <p className="mt-3 text-blue-100 max-w-3xl">
            {demoCourse.description}
          </p>

          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <Stat
              icon={<Layers />}
              label={`${demoCourse.modules.length} Modules`}
            />
            <Stat icon={<Clock />} label={demoCourse.duration} />
            <Stat icon={<BarChart />} label={demoCourse.level} />
          </div>
        </div>
      </section>

      {/* ===== MAIN ===== */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
        {/* VIDEO + INFO */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-2xl h-[360px] flex items-center justify-center text-white relative">
            <PlayCircle className="w-20 h-20 opacity-80" />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">What you’ll learn</h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <li>✔ Full stack applications</li>
              <li>✔ REST APIs with Node</li>
              <li>✔ MongoDB integration</li>
              <li>✔ Authentication systems</li>
              <li>✔ Real-world projects</li>
              <li>✔ Hackathon readiness</li>
            </ul>
          </div>
        </div>

        {/* MODULES */}
        <div className="bg-white rounded-2xl shadow p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">Course Modules</h3>

          {!enrolled && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Enroll to unlock all lessons and track progress.
              </p>

              <button
                onClick={handleEnroll}
                className="w-full py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Enroll Now
              </button>
            </>
          )}

          {enrolled && (
            <>
              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <ul className="space-y-3">
                {demoCourse.modules.map((m, i) => (
                  <li
                    key={i}
                    onClick={() => toggleModule(i)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition
                    ${
                      completed.includes(i)
                        ? "bg-green-50 border-green-400"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm">{m}</span>
                    <CheckCircle
                      className={`w-5 h-5 ${
                        completed.includes(i)
                          ? "text-green-500"
                          : "text-gray-300"
                      }`}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Courses are managed by Admin
          </p>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ icon, label }) => (
  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
    {icon}
    <span>{label}</span>
  </div>
);

export default CoursePage;
