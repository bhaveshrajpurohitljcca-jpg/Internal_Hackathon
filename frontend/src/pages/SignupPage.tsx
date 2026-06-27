import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/routes/paths";
import { authService } from "@/services/auth.service";

const signupSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  team_name: z.string().min(2, "Team name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  enrollment_number: z.string().min(5, "Enrollment number is required"),
  branch: z.string().min(2, "Branch is required"),
  semester: z.coerce.number().min(1, "Semester must be at least 1").max(10, "Semester must be max 10"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { confirm_password, ...apiData } = data;
      await authService.signup(apiData);
      toast.success("Account created successfully! Please login.");
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center py-12 px-4">
      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 shadow-xl border border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Student Registration</CardTitle>
          <CardDescription>Join the internal college hackathon portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Team Leader Name"
                placeholder="John Doe"
                error={errors.full_name?.message}
                {...register("full_name")}
              />
              <Input
                label="Team Name"
                placeholder="Code Ninjas"
                error={errors.team_name?.message}
                {...register("team_name")}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@college.edu"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Enrollment Number"
                placeholder="e.g. 123456789"
                error={errors.enrollment_number?.message}
                {...register("enrollment_number")}
              />
              <Input
                label="Branch"
                placeholder="Computer Science"
                error={errors.branch?.message}
                {...register("branch")}
              />
              <Input
                label="Semester"
                type="number"
                placeholder="e.g. 5"
                error={errors.semester?.message}
                {...register("semester")}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirm_password?.message}
                {...register("confirm_password")}
              />
            </div>
            
            <Button type="submit" className="w-full mt-8" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{" "}
              <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
