import { Link } from "react-router-dom";
import { Server } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import { useHealthCheck, useProjectMetadata } from "@/hooks/useHealthCheck";
import { ROUTES } from "@/routes/paths";

export default function LandingPage() {
  const { data: health, isLoading, isError } = useHealthCheck();
  const { data: metadata } = useProjectMetadata();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 px-8 py-12 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          College Internal Hackathon Portal
        </h1>
        <p className="mt-4 max-w-2xl text-primary-100">
          Manage registrations, teams, submissions, and judging for your college internal
          hackathon — all in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={ROUTES.SIGNUP}>
            <Button className="bg-white text-primary-700 hover:bg-primary-50">Get Started</Button>
          </Link>
          <Link to={ROUTES.STUDENT_HACKATHONS}>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Browse Hackathons
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary-600" />
              <CardTitle>API Status</CardTitle>
            </div>
            <CardDescription>Backend connectivity check</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <Loading label="Checking backend…" />}
            {isError && (
              <p className="text-sm text-red-600">
                Unable to reach the backend. Ensure the API server is running on port 8000.
              </p>
            )}
            {health && (
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {health.service}: {health.status}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Info</CardTitle>
            <CardDescription>Application metadata from the API</CardDescription>
          </CardHeader>
          <CardContent>
            {metadata ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Version</dt>
                  <dd className="font-medium">{metadata.version}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Environment</dt>
                  <dd className="font-medium capitalize">{metadata.environment}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Service</dt>
                  <dd className="font-medium">{metadata.service}</dd>
                </div>
              </dl>
            ) : (
              <Loading label="Loading metadata…" size="sm" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
