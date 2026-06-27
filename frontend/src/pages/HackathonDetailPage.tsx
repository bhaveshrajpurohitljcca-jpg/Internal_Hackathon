import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hackathonService } from "@/services/hackathon.service";
import { problemStatementService } from "@/services/problem-statement.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import RegistrationModal from "@/components/RegistrationModal";

export const HackathonDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const { data: hackathon, isLoading, isError } = useQuery({
    queryKey: ["hackathon", slug],
    queryFn: () => hackathonService.getBySlug(slug!),
  });

  const { data: problemsData, isLoading: isLoadingProblems } = useQuery({
    queryKey: ["hackathonProblems", slug],
    queryFn: () => problemStatementService.getForHackathon(slug!),
    enabled: !!hackathon,
  });

  if (isLoading) return <PageLoader />;
  
  if (isError || !hackathon) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hackathon not found</h2>
        <Link to="/student/hackathons" className="text-indigo-600 hover:underline">
          &larr; Back to Hackathons
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header section with Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
        <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600 w-full object-cover flex items-center justify-center relative">
            {hackathon.is_featured && (
                <span className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center">
                ⭐ Featured
                </span>
            )}
        </div>
        <div className="p-8 md:p-10 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    {hackathon.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 font-medium">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">{hackathon.mode}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full flex items-center"><span className="mr-1">📍</span> {hackathon.location}</span>
                  </div>
                </div>
                <StatusBadge status={hackathon.status} />
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {hackathon.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="text-sm font-medium text-indigo-600 mb-1">Registration Opens</div>
                <div className="font-semibold text-gray-900">
                  {new Date(hackathon.registration_start_date).toLocaleString()}
                </div>
              </div>
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                <div className="text-sm font-medium text-purple-600 mb-1">Registration Closes</div>
                <div className="font-semibold text-gray-900">
                  {new Date(hackathon.registration_end_date).toLocaleString()}
                </div>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <div className="text-sm font-medium text-orange-600 mb-1">Submission Deadline</div>
                <div className="font-semibold text-gray-900">
                  {new Date(hackathon.submission_deadline).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
               {hackathon.max_teams && (
                  <div className="text-gray-600 font-medium">
                     👥 Max Teams: <span className="text-gray-900">{hackathon.max_teams}</span>
                  </div>
               )}
               <div className="flex-grow"></div>
               <button 
                  onClick={() => setIsRegistrationModalOpen(true)}
                  disabled={!hackathon.is_registration_open}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {hackathon.is_registration_open ? "Register Now" : "Registration Closed"}
               </button>
            </div>
          </div>
        </div>
      </div>
      {/* Problem Statements Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Problem Statements</h2>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {problemsData?.items.length || 0} Problems
          </span>
        </div>

        {isLoadingProblems ? (
          <div className="flex justify-center p-8"><PageLoader /></div>
        ) : !problemsData?.items.length ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500">No problem statements have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemsData.items.map((problem: any) => {
              const difficultyColors: Record<string, string> = {
                EASY: "bg-green-100 text-green-800",
                MEDIUM: "bg-yellow-100 text-yellow-800",
                HARD: "bg-red-100 text-red-800",
              };
              const colorClass = difficultyColors[problem.difficulty] || "bg-gray-100 text-gray-800";

              return (
                <Link key={problem.id} to={`/student/hackathons/${slug}/problems/${problem.id}`} className="block group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-mono text-sm font-semibold text-gray-500">{problem.problem_code}</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
                      {problem.description}
                    </p>
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md font-medium">
                        {problem.category}
                      </span>
                      <span className="text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <RegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={() => setIsRegistrationModalOpen(false)} 
        initialHackathonId={hackathon.id}
      />
    </div>
  );
};

export default HackathonDetailPage;
