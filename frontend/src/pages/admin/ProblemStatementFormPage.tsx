import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { problemStatementService, ProblemDifficulty } from "@/services/problem-statement.service";
import { hackathonService } from "@/services/hackathon.service";
import PageLoader from "@/components/ui/PageLoader";

const problemSchema = z.object({
  hackathon_id: z.string().min(1, "Hackathon is required"),
  problem_code: z.string().min(3, "Problem code must be at least 3 characters").max(20),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.nativeEnum(ProblemDifficulty),
  category: z.string().min(2, "Category is required").max(50),
});

type ProblemFormData = z.infer<typeof problemSchema>;

export const ProblemStatementFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hackathonSearch] = useState("");

  const { data: problem, isLoading: isLoadingProblem } = useQuery({
    queryKey: ["problemStatement", id],
    queryFn: () => problemStatementService.getById(id!),
    enabled: isEditing,
  });

  const { data: hackathonsData } = useQuery({
    queryKey: ["adminHackathons", hackathonSearch],
    queryFn: () => hackathonService.getAll({ page: 1, page_size: 50, search: hackathonSearch }),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema) as any,
    defaultValues: {
      hackathon_id: "",
      problem_code: "",
      title: "",
      description: "",
      difficulty: ProblemDifficulty.EASY,
      category: "",
    }
  });

  useEffect(() => {
    if (problem) {
      reset({
        hackathon_id: problem.hackathon_id,
        problem_code: problem.problem_code,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category: problem.category,
      });
    }
  }, [problem, reset]);

  const createMutation = useMutation({
    mutationFn: problemStatementService.create,
    onSuccess: () => {
      toast.success(`Problem statement ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ["adminProblemStatements"] });
      queryClient.invalidateQueries({ queryKey: ["hackathonProblems"] });
      navigate("/admin/problem-statements");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create problem statement");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProblemFormData) => problemStatementService.update(id!, data),
    onSuccess: () => {
      toast.success("Problem statement updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminProblemStatements"] });
      queryClient.invalidateQueries({ queryKey: ["hackathonProblems"] });
      queryClient.invalidateQueries({ queryKey: ["problemStatement", id] });
      navigate("/admin/problem-statements");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update problem statement");
    }
  });

  const onSubmit = (data: ProblemFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditing && isLoadingProblem) return <PageLoader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? "Edit Problem Statement" : "Create Problem Statement"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/admin/problem-statements")}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Hackathon</label>
              <select
                {...register("hackathon_id")}
                disabled={isEditing}
                className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 transition-colors"
              >
                <option value="">Select a Hackathon</option>
                {hackathonsData?.items.map(h => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
              </select>
              {errors.hackathon_id && <p className="mt-1 text-sm text-red-600">{errors.hackathon_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Problem Code</label>
              <input
                type="text"
                {...register("problem_code")}
                disabled={isEditing}
                placeholder="e.g. PS-001"
                className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border disabled:bg-slate-50 dark:disabled:bg-slate-800 uppercase bg-white dark:bg-slate-900 dark:text-white transition-colors"
              />
              {errors.problem_code && <p className="mt-1 text-sm text-red-600">{errors.problem_code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
              <input
                type="text"
                {...register("title")}
                className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Difficulty</label>
                <select
                  {...register("difficulty")}
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                >
                  <option value={ProblemDifficulty.EASY}>Easy</option>
                  <option value={ProblemDifficulty.MEDIUM}>Medium</option>
                  <option value={ProblemDifficulty.HARD}>Hard</option>
                </select>
                {errors.difficulty && <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <input
                  type="text"
                  {...register("category")}
                  placeholder="e.g. Web Development"
                  className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                />
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                {...register("description")}
                rows={8}
                className="mt-1.5 block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border bg-white dark:bg-slate-900 dark:text-white transition-colors"
                placeholder="Detailed explanation of the problem statement..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Problem Statement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemStatementFormPage;
