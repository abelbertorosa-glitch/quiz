import { redirect } from "next/navigation";
import { publicPath } from "@/lib/pdf-path";

export default function LeadPage() {
  redirect(publicPath("/quiz"));
}
