import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FaGithub } from "react-icons/fa";

export default async function Page() {
  const session = await auth();

  if (session?.user) return redirect("/");

  return (
    <div className="text-center flex flex-col gap-3 h-screen justify-center items-center">
      <h1>Login</h1>
      <p className="muted">
        Please click the button below to start using the drive app.
      </p>

      <form
        onSubmit={async () => {
          "use server";

          await signIn("github");
        }}
      >
        <Button variant="outline" type="submit">
          <FaGithub />
          GitHub
        </Button>
      </form>
    </div>
  );
}
