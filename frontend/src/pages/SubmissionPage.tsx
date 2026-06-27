import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationService } from "@/services/registration.service";
import { submissionService, SubmissionStatus } from "@/services/submission.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { FileUp, Save } from "lucide-react";
import toast from "react-hot-toast";

function FileUploadDropzone({
  accept,
  url,
  setUrl,
  label,
  isReadonly,
}: {
  accept: string;
  url: string;
  setUrl: (url: string) => void;
  label: string;
  isReadonly: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileSizeStr, setFileSizeStr] = useState("");

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Check file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File exceeds 50MB limit");
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setFileSizeStr((file.size / (1024 * 1024)).toFixed(2) + " MB");
    
    try {
      const { uploadService } = await import("@/services/upload.service");
      const uploadedUrl = await uploadService.uploadFile(file, setProgress);
      setUrl(uploadedUrl);
      toast.success(`${label} uploaded successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to upload ${label}`);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const getFilename = (u: string) => {
    try { return new URL(u).pathname.split('/').pop() || u; } catch { return u; }
  };

  if (url) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center justify-between p-3 border rounded-xl bg-green-50 border-green-200">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-green-800 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Upload Complete
            </span>
            <div className="flex items-center mt-1">
               <a href={url} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline truncate max-w-[200px]">
                 {getFilename(url)}
               </a>
               {fileSizeStr && <span className="text-xs text-green-500 ml-2">({fileSizeStr})</span>}
            </div>
          </div>
          {!isReadonly && (
            <button type="button" onClick={() => setUrl("")} className="text-red-500 text-sm hover:underline ml-4 flex-shrink-0 font-medium">
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
             <div className="w-full bg-gray-200 rounded-full h-2.5">
               <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>
             <span className="text-sm font-medium text-indigo-600">Uploading... {progress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1 py-2">
             <FileUp className="h-6 w-6 text-gray-400 mb-1" />
             <span className="text-sm font-medium text-gray-600">Click or drag file to upload</span>
             <span className="text-xs text-gray-400">Accepts: {accept} (Max 50MB)</span>
             <input
               type="file"
               accept={accept}
               onChange={onFileChange}
               disabled={isReadonly}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
             />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubmissionPage() {
  const { data: registrationsData, isLoading: isLoadingRegs } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  if (isLoadingRegs) return <PageLoader />;

  const registrations = registrationsData?.items || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Submissions</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Manage your hackathon project submissions.
        </p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={<FileUp className="h-10 w-10" />}
          title="No submissions available"
          description="Register for a hackathon first to submit a project."
        />
      ) : (
        <div className="space-y-6">
          {registrations.map((reg) => (
            <SubmissionCard key={reg.id} registrationId={reg.id} teamName={reg.team_name} registrationStatus={reg.status} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ registrationId, teamName, registrationStatus }: { registrationId: string; teamName: string; registrationStatus: string }) {
  const queryClient = useQueryClient();
  const [repoUrl, setRepoUrl] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [pptUrl, setPptUrl] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [notes, setNotes] = useState("");

  const { data: submission, isLoading } = useQuery({
    queryKey: ["submission", registrationId],
    queryFn: () => submissionService.getByRegistrationId(registrationId),
  });

  // Initialize form state once data is loaded
  React.useEffect(() => {
    if (submission) {
      setRepoUrl(submission.repository_url || "");
      setDemoVideoUrl(submission.demo_video_url || "");
      setPptUrl(submission.ppt_url || "");
      setZipUrl(submission.zip_url || "");
      setProjectDescription(submission.project_description || "");
      setTechStack(submission.tech_stack || "");
      setNotes(submission.notes || "");
    }
  }, [submission]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => submissionService.update(submission!.id, data),
    onSuccess: () => {
      toast.success("Project submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["submission", registrationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to submit project");
    },
  });

  const isValidVideoUrl = (url: string) => {
    if (!url) return true;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    const driveRegex = /^(https?:\/\/)?(www\.)?(drive\.google\.com)\/.+$/;
    const uploadedRegex = /\.(mp4|mov|webm|avi|mkv)$/i;
    return youtubeRegex.test(url) || driveRegex.test(url) || uploadedRegex.test(url);
  };

  const isVideoValid = isValidVideoUrl(demoVideoUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    if (!isVideoValid) {
      toast.error("Please provide a valid Demo Video URL or upload a file");
      return;
    }
    updateMutation.mutate({
      repository_url: repoUrl,
      demo_video_url: demoVideoUrl,
      ppt_url: pptUrl,
      zip_url: zipUrl,
      project_description: projectDescription,
      tech_stack: techStack,
      notes: notes,
    });
  };

  if (isLoading) return <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32" />;
  if (!submission) return null;

  const isReadonly = submission.status !== SubmissionStatus.DRAFT;

  if (registrationStatus !== "APPROVED") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Team: {teamName}</h3>
        <p className="text-sm text-gray-500 mb-4">Your registration must be approved by an Admin before you can submit your project.</p>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
          Registration Status: {registrationStatus}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team: {teamName}</h3>
          <p className="text-sm text-gray-500 font-mono">Submission ID: {submission.id.slice(0, 8)}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {(submission.score !== null || submission.feedback) && (
        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <h4 className="text-sm font-bold text-indigo-900 mb-2">Feedback & Score</h4>
          {submission.score !== null && (
            <p className="text-sm text-indigo-800 mb-1">
              <span className="font-semibold">Score:</span> {submission.score} / 100
            </p>
          )}
          {submission.feedback && (
            <p className="text-sm text-indigo-800">
              <span className="font-semibold">Feedback:</span> {submission.feedback}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository URL *</label>
            <input
              type="url"
              required
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isReadonly || updateMutation.isPending}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="https://github.com/..."
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Demo Video (URL or Upload)</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
                disabled={isReadonly || updateMutation.isPending}
                className={`flex-1 rounded-xl border px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 ${!isVideoValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="YouTube or Google Drive Link"
              />
              <div className="relative">
                <input
                  type="file"
                  accept=".mp4,.mov,.webm,.avi,.mkv"
                  onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    if (file.size > 50 * 1024 * 1024) {
                      toast.error("File exceeds 50MB limit");
                      return;
                    }

                    const validateDuration = (f: File): Promise<void> => {
                      return new Promise((resolve, reject) => {
                        const video = document.createElement('video');
                        video.preload = 'metadata';
                        video.onloadedmetadata = () => {
                          window.URL.revokeObjectURL(video.src);
                          if (video.duration > 300) {
                            reject(new Error("Video duration cannot exceed 5 minutes."));
                          } else {
                            resolve();
                          }
                        };
                        video.onerror = () => reject(new Error("Invalid video file."));
                        video.src = URL.createObjectURL(f);
                      });
                    };

                    const toastId = toast.loading("Validating video...");
                    try {
                      await validateDuration(file);
                      toast.loading("Uploading video...", { id: toastId });
                      const { uploadService } = await import("@/services/upload.service");
                      const uploadedUrl = await uploadService.uploadFile(file);
                      setDemoVideoUrl(uploadedUrl);
                      toast.success("Video uploaded successfully", { id: toastId });
                    } catch (err: any) {
                      toast.error(err.message || err.response?.data?.detail || "Failed to upload video", { id: toastId });
                    }
                  }}
                  disabled={isReadonly || updateMutation.isPending}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  title="Upload Video File"
                />
                <button
                  type="button"
                  disabled={isReadonly || updateMutation.isPending}
                  className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl border border-primary-100 hover:bg-primary-100 font-semibold h-full flex items-center disabled:opacity-50 transition-colors dark:bg-primary-500/10 dark:border-primary-500/20 dark:text-primary-400 dark:hover:bg-primary-500/20"
                >
                  <FileUp className="w-4 h-4 mr-2" /> Upload
                </button>
              </div>
            </div>
            {!isVideoValid && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                Invalid URL. Please enter a valid YouTube link, Google Drive link, or upload an MP4/MOV file directly.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Description *</label>
          <textarea
            required
            rows={4}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            disabled={isReadonly || updateMutation.isPending}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Describe your project, the problem it solves, and how it works..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              disabled={isReadonly || updateMutation.isPending}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="React, Node.js, Python..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isReadonly || updateMutation.isPending}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Any setup instructions or caveats..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <FileUploadDropzone
            accept=".ppt,.pptx,.pdf"
            label="Presentation (PPT/PDF)"
            url={pptUrl}
            setUrl={setPptUrl}
            isReadonly={isReadonly}
          />
          <FileUploadDropzone
            accept=".zip,.rar,.tar.gz"
            label="Source Code (ZIP/RAR)"
            url={zipUrl}
            setUrl={setZipUrl}
            isReadonly={isReadonly}
          />
        </div>

        {!isReadonly && (
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending || !repoUrl || !projectDescription || !isVideoValid}
              className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save & Submit Project"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

