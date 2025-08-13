"use client";

import { usePathname } from "next/navigation";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function SiteHeader() {
	const pathname = usePathname();
	const segments = pathname.split("/").filter(Boolean);

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						{segments.length > 0 &&
							segments.map((segment, index) => {
								const isLast = index === segments.length - 1;
								const href = `/${segments.slice(0, index + 1).join("/")}`;
								const uniqueKey = segments.slice(0, index + 1).join("-");

								return (
									<BreadcrumbItem key={uniqueKey}>
										{!isLast ? (
											<>
												<BreadcrumbLink href={href}>
													{segment.charAt(0).toUpperCase() + segment.slice(1)}
												</BreadcrumbLink>
												<BreadcrumbSeparator />
											</>
										) : (
											<BreadcrumbPage>
												{segment.charAt(0).toUpperCase() + segment.slice(1)}
											</BreadcrumbPage>
										)}
									</BreadcrumbItem>
								);
							})}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<div className="flex flex-1 items-center justify-end space-x-4 pr-4">
				<>

				</>
			</div>
		</header>
	);
}
