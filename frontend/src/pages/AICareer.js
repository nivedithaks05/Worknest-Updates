import { useState } from "react";
import api from "../api/client";

function AICareer() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [education, setEducation] = useState("bachelors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        interests: interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        education_level: education,
      };

      const response = await api.post("ai/recommend-career/", payload);
      setResult(response.data);
    } catch (err) {
      console.error("AI recommendation failed", err);
      setError("Unable to generate recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            AI Career Path Advisor
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Let WorkNest AI suggest a tailored career path based on your skills
            and interests.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-xs text-white shadow-sm">
          Experimental · Internal Preview
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,2.2fr)] gap-6">
        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-lg border border-slate-700"
        >
          <h3 className="text-sm font-semibold mb-4">
            Tell us about your profile
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block mb-1 text-slate-200">
                Key skills (comma-separated)
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Python, React, SQL, leadership"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-200">
                Interests (comma-separated)
              </label>
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. data, product strategy, mentoring, design"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-200">
                Highest education level
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bachelors">Bachelor&apos;s</option>
                <option value="masters">Master&apos;s</option>
                <option value="phd">PhD</option>
                <option value="diploma">Diploma</option>
                <option value="self-taught">Self-taught</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:from-indigo-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Generating recommendation..." : "Generate Recommendation"}
          </button>

          {error && (
            <p className="mt-3 text-[11px] text-red-300 bg-red-900/40 border border-red-500/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Result panel */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 min-h-[260px] flex flex-col">
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-sm text-gray-500">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 via-blue-100 to-slate-100 flex items-center justify-center mb-3">
                <span className="text-xl font-semibold text-indigo-600">
                  AI
                </span>
              </div>
              <p className="font-medium text-gray-800 mb-1">
                No recommendation yet
              </p>
              <p className="text-xs text-gray-500 max-w-xs">
                Fill in your skills, interests, and education, then let WorkNest
                AI sketch a potential career direction for you.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Recommended Career Path
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {result.recommended_career_path}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Confidence score:{" "}
                  <span className="font-semibold text-indigo-600">
                    {(result.confidence_score * 100).toFixed(0)}%
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Skill Gap Analysis
                </p>
                {result.skill_gap_analysis?.length ? (
                  <ul className="flex flex-wrap gap-1">
                    {result.skill_gap_analysis.map((skill) => (
                      <li
                        key={skill}
                        className="px-2 py-0.5 rounded-full bg-indigo-50 text-[11px] text-indigo-700 border border-indigo-100"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">
                    No major gaps detected based on your input.
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Suggested Courses
                </p>
                <ul className="space-y-1 text-xs text-gray-700">
                  {result.suggested_courses?.map((course) => (
                    <li
                      key={course}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AICareer;

