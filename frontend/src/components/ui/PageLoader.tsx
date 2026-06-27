import Loading from "@/components/ui/Loading";

export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loading label="Loading page…" size="lg" />
    </div>
  );
}
