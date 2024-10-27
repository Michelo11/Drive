import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import Link from "next/link";

export default async function UserNav() {
  const session = await auth();

  return (
    <div className="flex items-center justify-between">
      <Link className="flex gap-3 items-center" href="/">
        <Avatar className="h-8 w-8" draggable={false}>
          <AvatarImage
            src="https://michelemanna.me/img/logo.png"
            draggable={false}
          />
          <AvatarFallback>{session?.user.name}</AvatarFallback>
        </Avatar>
        <h3>Drive</h3>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full ml-auto flex"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={session?.user.image || undefined}
                alt={session?.user.name || undefined}
              />
              <AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session?.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/">
              <DropdownMenuItem>Home</DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="w-full">
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
