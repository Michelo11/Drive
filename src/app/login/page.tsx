import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (session?.user) return redirect("/");

  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button type="submit">GitHub</Button>
    </form>
  );
}
