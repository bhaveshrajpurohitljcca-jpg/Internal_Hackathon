import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { hackathonService } from "@/services/hackathon.service";
import type { PaginatedResponse, Hackathon } from "@/services/hackathon.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";

export const HackathonsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Hackathon>>({
    queryKey: ["studentHackathons", page, search],
    queryFn: () => hackathonService.getAll({ page, page_size: 9, search }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Available Hackathons</h1>
          <p className="mt-2 text-sm text-gray-600">Discover and participate in upcoming challenges</p>
        </div>
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search hackathons..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {!data?.items.length ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900">No hackathons found</h3>
          <p className="text-gray-500 mt-2">Check back later for new events.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.items.map((hackathon: any) => (
              <Link key={hackathon.id} to={`/student/hackathons/${hackathon.slug}`} className="block group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center p-6 relative">
                    {hackathon.is_featured && (
                      <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        ⭐ Featured
                      </span>
                    )}
                    <h3 className="text-white text-2xl font-bold text-center line-clamp-2">{hackathon.title}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <StatusBadge status={hackathon.status} />
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {hackathon.mode}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{hackathon.description}</p>
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        {new Date(hackathon.registration_start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-indigo-600 font-medium">
                        View Details &rarr;
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.total_pages > 1 && (
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2 border rounded-full text-sm font-medium text-gray-700 bg-white disabled:opacity-50 hover:bg-gray-50 shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="px-6 py-2 border rounded-full text-sm font-medium text-gray-700 bg-white disabled:opacity-50 hover:bg-gray-50 shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HackathonsPage;
