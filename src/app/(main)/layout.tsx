"use client";

import { AppSidebar } from "@/components/app-sidebar";
import SiteHeader from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<div className="flex flex-col h-screen overflow-hidden">
					<div className="shrink-0">
						<SiteHeader />
					</div>
					<div className="grow overflow-hidden">
						<div className="h-full md:p-2">{children}</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

