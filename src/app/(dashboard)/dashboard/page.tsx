import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import GreetingDashText from "@/components/greeting";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();

    if (!session || !session.user) {
        return redirect("/signin");
    }

    return (
        <SidebarProvider>
        <AppSidebar
            session_data={{
                name: session.user.name ?? "unknown",
                email: session.user.email ?? "example@upio.dev",
                avatar: session.user.image ?? "https://avatar.vercel.sh/42",
            }}
        />
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                        Dashboard
                    </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                    <BreadcrumbPage>Main</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <GreetingDashText name={session.user.name ?? "unknown"} />
                <p>Welcome to mspaint web dashboard!</p>
            </div>
        </SidebarInset>
        </SidebarProvider>
    );
}
