import { redirect } from "next/navigation";

// Arena accounts are created exclusively through GU2K.
export default function SignUpPage() {
  redirect("/login");
}
