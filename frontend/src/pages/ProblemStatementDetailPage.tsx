import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { problemStatementService } from "@/services/problem-statement.service";
import PageLoader from "@/components/ui/PageLoader";

export const ProblemStatementDetailPage: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();

  const { data: problem, isLoading } = useQuery({
    queryKey: ["studentProblemStatement", slug, id],
    queryFn: () => problemStatementService.getForHackathonById(slug!, id!),
  });

  if (isLoading) return <PageLoader />;
  if (!problem) return <div className="text-center p-8">Problem statement not found.</div>;

  const difficultyColors: Record<string, string> = {
    EASY: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HARD: "bg-red-100 text-red-800",
  };
  const colorClass = difficultyColors[problem.difficulty] || "bg-gray-100 text-gray-800";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <Link to={`/student/hackathons/${slug}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
          &larr; Back to Hackathon
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-mono text-sm text-gray-500">{problem.problem_code}</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                {problem.difficulty}
              </span>
              <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                {problem.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
          </div>
        </div>

        <div className="p-8 prose max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Description</h3>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {problem.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemStatementDetailPage;
