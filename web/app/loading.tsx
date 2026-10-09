import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-vouch" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Skeleton label="page" />
    </div>
  );
}
