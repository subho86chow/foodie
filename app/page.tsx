import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Meal Tracker
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        Simple meal tracking for your daily needs. Mark attendance, view bills, and manage your mess efficiently.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/sign-in">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
