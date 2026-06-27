import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionService } from "@/services/submission.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { FileUp, Link as LinkIcon, Edit, Download, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { hackathonService } from "@/services/hackathon.service";
import { problemStatementService } from "@/services/problem-statement.service";
import { evaluationService } from "@/services/evaluation.service";

export default function AdminSubmissionListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [declareWinnersModalOpen, setDeclareWinnersModalOpen] = useState(false);
  const [dwHackathonId, setDwHackathonId] = useState("");
  const [dwProblemId, setDwProblemId] = useState("");

  // Review Form State
  const [innovation, setInnovation] = useState<number | "">("");
  const [technical, setTechnical] = useState<number | "">("");
  const [presentation, setPresentation] = useState<number | "">("");
  const [impact, setImpact] = useState<number | "">("");
  const [uiUx, setUiUx] = useState<number | "">("");
  const [documentation, setDocumentation] = useState<number | "">("");
  const [reviewRemarks, setReviewRemarks] = useState("");

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrlToPlay, setVideoUrlToPlay] = useState("");

  const isVideoUpload = (url: string) => /\.(mp4|mov|webm|avi|mkv)$/i.test(url);

  const handleVideoClick = (url: string, e: React.MouseEvent) => {
    if (isVideoUpload(url)) {
      e.preventDefault();
      setVideoUrlToPlay(url);
      setVideoModalOpen(true);
    }
  };
  
  const { data, isLoading } = useQuery({
    queryKey: ["adminSubmissions", page],
    queryFn: () => submissionService.getAll({ page }),
  });

  const { data: hackathonsData } = useQuery({
    queryKey: ["hackathons", "all"],
    queryFn: async () => hackathonService.getAll({ page_size: 100 }),
    enabled: declareWinnersModalOpen,
  });

  const selectedHackathonObj = hackathonsData?.items.find((h) => h.id === dwHackathonId);

  const { data: problemsData } = useQuery({
    queryKey: ["hackathonProblems", selectedHackathonObj?.slug],
    queryFn: () => problemStatementService.getForHackathon(selectedHackathonObj!.slug),
    enabled: !!selectedHackathonObj && declareWinnersModalOpen,
  });

  const declareWinnersMutation = useMutation({
    mutationFn: (problemId: string) => evaluationService.declareWinners(problemId),
    onSuccess: () => {
      toast.success("Winners declared successfully!");
      setDeclareWinnersModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to declare winners");
    },
  });

  const openReviewModal = (sub: any) => {
    setSelectedSubmission(sub);
    
    // Check if current user has an evaluation on this sub
    const existingEval = sub.evaluations?.[0]; // Admin might only have 1 or we just map it. Wait, the backend doesn't send evaluations yet.
    // For now, if sub.score exists, we can't reverse engineer it perfectly without evaluations relation.
    // Let's assume we start empty if no details.
    setInnovation(existingEval?.innovation_score ?? "");
    setTechnical(existingEval?.technical_score ?? "");
    setPresentation(existingEval?.presentation_score ?? "");
    setImpact(existingEval?.impact_score ?? "");
    setUiUx(existingEval?.ui_ux_score ?? "");
    setDocumentation(existingEval?.documentation_score ?? "");
    setReviewRemarks(existingEval?.remarks || sub.remarks || "");
    
    setReviewModalOpen(true);
  };

  const evalMutation = useMutation({
    mutationFn: evaluationService.evaluateSubmission,
    onSuccess: () => {
      toast.success("Evaluation saved");
      setReviewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
    },
    onError: () => {
      toast.error("Failed to save evaluation");
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    if (
      innovation === "" ||
      technical === "" ||
      presentation === "" ||
      impact === "" ||
      uiUx === "" ||
      documentation === ""
    ) {
      toast.error("Please fill all score fields");
      return;
    }

    evalMutation.mutate({
      submission_id: selectedSubmission.id,
      innovation_score: Number(innovation),
      technical_score: Number(technical),
      presentation_score: Number(presentation),
      impact_score: Number(impact),
      ui_ux_score: Number(uiUx),
      documentation_score: Number(documentation),
      remarks: reviewRemarks,
    });
  };

  if (isLoading) return <PageLoader />;

  const submissions = data?.items || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Submissions</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review and manage hackathon project submissions.
          </p>
        </div>
        <button
          onClick={() => {
            setDwHackathonId("");
            setDwProblemId("");
            setDeclareWinnersModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Trophy className="w-4 h-4 mr-2" /> Declare Winners
        </button>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={<FileUp className="h-10 w-10" />}
          title="No submissions found"
          description="Teams haven't submitted any projects yet."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-700/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reg ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/60">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono" title={sub.registration_id}>
                      {sub.registration_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {sub.score !== null ? sub.score : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(sub.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(sub.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openReviewModal(sub)}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Page {data.page} of {data.total_pages} ({data.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  Prev
                </button>
                <button
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden my-8 relative flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Submission</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">ID: {selectedSubmission.id}</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Submission Links & Info */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-700/60 pb-2">Project Details</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Description</span>
                        <p className="text-slate-900 dark:text-slate-300 whitespace-pre-wrap">{selectedSubmission.project_description || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Tech Stack</span>
                        <p className="text-slate-900 dark:text-slate-300">{selectedSubmission.tech_stack || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Student Notes</span>
                        <p className="text-slate-900 dark:text-slate-300">{selectedSubmission.notes || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-700/60 pb-2">Attachments & Links</h4>
                    <div className="space-y-2 text-sm flex flex-col">
                      {selectedSubmission.repository_url ? (
                        <a href={selectedSubmission.repository_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2 py-1">
                          <LinkIcon className="w-4 h-4" /> GitHub Repository
                        </a>
                      ) : <span className="text-gray-400">No Repository URL</span>}

                      {selectedSubmission.demo_video_url ? (
                        <a 
                          href={selectedSubmission.demo_video_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => handleVideoClick(selectedSubmission.demo_video_url, e)}
                          className="text-indigo-600 hover:underline flex items-center gap-2 py-1"
                        >
                          <LinkIcon className="w-4 h-4" /> 
                          {isVideoUpload(selectedSubmission.demo_video_url) ? "Play Uploaded Video" : "Watch Demo Video"}
                        </a>
                      ) : <span className="text-gray-400">No Demo Video</span>}
                      
                      {selectedSubmission.ppt_url ? (
                        <a href={selectedSubmission.ppt_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2 py-1">
                          <Download className="w-4 h-4" /> Download PPT/PDF
                        </a>
                      ) : <span className="text-gray-400">No PPT Uploaded</span>}

                      {selectedSubmission.zip_url ? (
                        <a href={selectedSubmission.zip_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2 py-1">
                          <Download className="w-4 h-4" /> Download Source Code (ZIP)
                        </a>
                      ) : <span className="text-gray-400">No ZIP Uploaded</span>}
                    </div>
                  </div>
                </div>

                <form id="reviewForm" onSubmit={handleReviewSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-700/60 pb-2 flex items-center justify-between">
                    <span>Admin Evaluation</span>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
                      Total: {
                        (Number(innovation) || 0) +
                        (Number(technical) || 0) +
                        (Number(presentation) || 0) +
                        (Number(impact) || 0) +
                        (Number(uiUx) || 0) +
                        (Number(documentation) || 0)
                      }
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Innovation (0-20)</label>
                      <input type="number" min="0" max="20" required value={innovation} onChange={e => setInnovation(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Technical (0-30)</label>
                      <input type="number" min="0" max="30" required value={technical} onChange={e => setTechnical(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">UI/UX (0-15)</label>
                      <input type="number" min="0" max="15" required value={uiUx} onChange={e => setUiUx(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Impact (0-15)</label>
                      <input type="number" min="0" max="15" required value={impact} onChange={e => setImpact(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Presentation (0-10)</label>
                      <input type="number" min="0" max="10" required value={presentation} onChange={e => setPresentation(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Documentation (0-10)</label>
                      <input type="number" min="0" max="10" required value={documentation} onChange={e => setDocumentation(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Internal Remarks</label>
                    <textarea
                      rows={2}
                      value={reviewRemarks}
                      onChange={(e) => setReviewRemarks(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-900 dark:text-white"
                      placeholder="Private notes..."
                    />
                  </div>
                </form>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 shrink-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="reviewForm"
                disabled={evalMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {evalMutation.isPending ? "Saving..." : "Save Evaluation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setVideoModalOpen(false)}>
          <div className="bg-black rounded-2xl w-full max-w-4xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setVideoModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 font-medium"
            >
              Close (Esc)
            </button>
            <video 
              src={videoUrlToPlay} 
              controls 
              autoPlay 
              className="w-full h-auto rounded-2xl max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Declare Winners Modal */}
      {declareWinnersModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative flex flex-col border border-slate-100 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/60 shrink-0 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Declare Winners</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                This will automatically calculate scores and declare 1st, 2nd, and 3rd place winners for the selected problem statement.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Hackathon</label>
                <select
                  value={dwHackathonId}
                  onChange={(e) => {
                    setDwHackathonId(e.target.value);
                    setDwProblemId("");
                  }}
                  className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm"
                >
                  <option value="">-- Choose --</option>
                  {hackathonsData?.items.map(h => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                  ))}
                </select>
              </div>

              {dwHackathonId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Problem Statement</label>
                  <select
                    value={dwProblemId}
                    onChange={(e) => setDwProblemId(e.target.value)}
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">-- Choose --</option>
                    {problemsData?.items.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800 shrink-0 flex justify-end gap-3">
              <button
                onClick={() => setDeclareWinnersModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => declareWinnersMutation.mutate(dwProblemId)}
                disabled={!dwProblemId || declareWinnersMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {declareWinnersMutation.isPending ? "Declaring..." : "Declare Winners"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
