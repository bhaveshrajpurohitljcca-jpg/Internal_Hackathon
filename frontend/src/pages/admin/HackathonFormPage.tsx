import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { hackathonService, HackathonStatus, HackathonMode } from "@/services/hackathon.service";
import PageLoader from "@/components/ui/PageLoader";

const hackathonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  registration_start_date: z.string().min(1, "Start date is required"),
  registration_end_date: z.string().min(1, "End date is required"),
  submission_deadline: z.string().min(1, "Submission deadline is required"),
  status: z.nativeEnum(HackathonStatus).optional(),
  mode: z.nativeEnum(HackathonMode),
  location: z.string().min(1, "Location is required"),
  max_teams: z.union([z.string(), z.number()]).nullable().transform((val) => {
    if (val === "" || val === null || val === undefined) return null;
    return Number(val);
  }),
  min_team_members: z.coerce.number().min(1).default(1),
  max_team_members: z.coerce.number().min(1).default(4),
  min_female_members: z.coerce.number().min(0).default(0),
  max_female_members: z.union([z.string(), z.number()]).nullable().transform((val) => {
    if (val === "" || val === null || val === undefined) return null;
    return Number(val);
  }),
  allow_individual: z.boolean().default(true),
  allow_cross_department: z.boolean().default(true),
  allow_multiple_teams_per_student: z.boolean().default(false),
  is_private: z.boolean().default(false),
  is_featured: z.boolean(),
}).refine((data) => {
  if (data.registration_start_date && data.registration_end_date) {
    return new Date(data.registration_end_date) > new Date(data.registration_start_date);
  }
  return true;
}, {
  message: "Registration end date must be after start date",
  path: ["registration_end_date"],
}).refine((data) => {
  if (data.registration_end_date && data.submission_deadline) {
    return new Date(data.submission_deadline) > new Date(data.registration_end_date);
  }
  return true;
}, {
  message: "Submission deadline must be after registration end date",
  path: ["submission_deadline"],
});

type HackathonFormData = z.infer<typeof hackathonSchema>;

export const HackathonFormPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const isEditing = Boolean(slug);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery({
    queryKey: ["hackathon", slug],
    queryFn: () => hackathonService.getBySlug(slug!),
    enabled: isEditing,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      registration_start_date: "",
      registration_end_date: "",
      submission_deadline: "",
      status: HackathonStatus.UPCOMING,
      mode: HackathonMode.OFFLINE,
      location: "LJ University",
      max_teams: null,
      min_team_members: 1,
      max_team_members: 4,
      min_female_members: 0,
      max_female_members: null,
      allow_individual: true,
      allow_cross_department: true,
      allow_multiple_teams_per_student: false,
      is_private: false,
      is_featured: false,
    }
  });

  useEffect(() => {
    if (hackathon) {
      reset({
        title: hackathon.title,
        description: hackathon.description,
        registration_start_date: new Date(hackathon.registration_start_date).toISOString().slice(0, 16),
        registration_end_date: new Date(hackathon.registration_end_date).toISOString().slice(0, 16),
        submission_deadline: new Date(hackathon.submission_deadline).toISOString().slice(0, 16),
        status: hackathon.status,
        mode: hackathon.mode,
        location: hackathon.location,
        max_teams: hackathon.max_teams,
        min_team_members: hackathon.min_team_members ?? 1,
        max_team_members: hackathon.max_team_members ?? 4,
        min_female_members: hackathon.min_female_members ?? 0,
        max_female_members: hackathon.max_female_members ?? null,
        allow_individual: hackathon.allow_individual ?? true,
        allow_cross_department: hackathon.allow_cross_department ?? true,
        allow_multiple_teams_per_student: hackathon.allow_multiple_teams_per_student ?? false,
        is_private: hackathon.is_private ?? false,
        is_featured: hackathon.is_featured,
      });
    }
  }, [hackathon, reset]);

  const createMutation = useMutation({
    mutationFn: hackathonService.create,
    onSuccess: () => {
      toast.success("Hackathon created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminHackathons"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      navigate("/admin/hackathons");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create hackathon");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: HackathonFormData) => hackathonService.update(hackathon!.id, data),
    onSuccess: () => {
      toast.success("Hackathon updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminHackathons"] });
      queryClient.invalidateQueries({ queryKey: ["hackathon", slug] });
      navigate("/admin/hackathons");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update hackathon");
    }
  });

  const onSubmit = (data: HackathonFormData) => {
    const formattedData = {
      ...data,
      max_teams: data.max_teams ? Number(data.max_teams) : null,
      banner_image: null, // Default
      registration_start_date: new Date(data.registration_start_date).toISOString(),
      registration_end_date: new Date(data.registration_end_date).toISOString(),
      submission_deadline: new Date(data.submission_deadline).toISOString(),
    };

    if (isEditing) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  if (isEditing && isLoadingHackathon) return <PageLoader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? "Edit Hackathon" : "Create Hackathon"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/admin/hackathons")}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
              <input
                type="text"
                {...register("title")}
                className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Registration Start</label>
                <input
                  type="datetime-local"
                  {...register("registration_start_date")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
                {errors.registration_start_date && <p className="mt-1 text-sm text-red-600">{errors.registration_start_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Registration End</label>
                <input
                  type="datetime-local"
                  {...register("registration_end_date")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
                {errors.registration_end_date && <p className="mt-1 text-sm text-red-600">{errors.registration_end_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Submission Deadline</label>
                <input
                  type="datetime-local"
                  {...register("submission_deadline")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
                {errors.submission_deadline && <p className="mt-1 text-sm text-red-600">{errors.submission_deadline.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mode</label>
                <select
                  {...register("mode")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors bg-white"
                >
                  <option value={HackathonMode.ONLINE}>Online</option>
                  <option value={HackathonMode.OFFLINE}>Offline</option>
                  <option value={HackathonMode.HYBRID}>Hybrid</option>
                </select>
                {errors.mode && <p className="mt-1 text-sm text-red-600">{errors.mode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <input
                  type="text"
                  {...register("location")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Max Teams (Optional)</label>
                <input
                  type="number"
                  {...register("max_teams")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
                {errors.max_teams && <p className="mt-1 text-sm text-red-600">{errors.max_teams.message}</p>}
              </div>
            </div>
            
            {isEditing && (
               <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  {...register("status")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors bg-white"
                >
                  <option value={HackathonStatus.UPCOMING}>Upcoming</option>
                  <option value={HackathonStatus.REGISTRATION_OPEN}>Registration Open</option>
                  <option value={HackathonStatus.SUBMISSION_OPEN}>Submission Open</option>
                  <option value={HackathonStatus.CLOSED}>Closed</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                {...register("is_featured")}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
              />
              <label htmlFor="is_featured" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Featured Hackathon (Show on landing page)
              </label>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/60 pb-2 pt-4">Team Rules & Configurations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Min Team Members</label>
                <input
                  type="number"
                  {...register("min_team_members")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Max Team Members</label>
                <input
                  type="number"
                  {...register("max_team_members")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Min Female Members (0 for none)</label>
                <input
                  type="number"
                  {...register("min_female_members")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Max Female Members (Optional)</label>
                <input
                  type="number"
                  {...register("max_female_members")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allow_individual"
                  {...register("allow_individual")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                />
                <label htmlFor="allow_individual" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Allow Individual Participation
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allow_cross_department"
                  {...register("allow_cross_department")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                />
                <label htmlFor="allow_cross_department" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Allow Cross-Department Teams
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allow_multiple_teams_per_student"
                  {...register("allow_multiple_teams_per_student")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                />
                <label htmlFor="allow_multiple_teams_per_student" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Allow Students to Join Multiple Teams
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_private"
                  {...register("is_private")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                />
                <label htmlFor="is_private" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Private Hackathon (Not shown in public lists)
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Hackathon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HackathonFormPage;
