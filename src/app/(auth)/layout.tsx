import UserNav from "@/components/user-nav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) return redirect("/login");

  return (
    <div className="p-3 space-y-3">
      <UserNav />
      {children}
    </div>
  );
}
