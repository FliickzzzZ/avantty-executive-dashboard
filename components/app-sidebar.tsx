"use client";

import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { AppSearch } from "@/components/app-search";
import { LatestChange } from "@/components/latest-change";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserRole, ROLE_CONFIGS } from "@/src/types";
import { useAppData } from "@/src/app-data-context";
import { SettingsIcon, LayoutDashboard, CalendarDays, Target, ScrollText, Mail } from "lucide-react";

interface AppSidebarProps {
	activePage: string;
	currentRole: UserRole;
	onSelectPage: (page: string) => void;
	onOpenSettings?: () => void;
}

export function AppSidebar({ activePage, currentRole, onSelectPage, onOpenSettings }: AppSidebarProps) {
	const { rolePermissions, whiteLabelConfig } = useAppData();
	const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.CEO;
	const allowed = (rolePermissions && Array.isArray(rolePermissions[currentRole]))
		? rolePermissions[currentRole]
		: (roleConfig?.allowedPages || ["dashboard", "meetings", "search-candidates", "follow-ups", "logs"]);

	const allNavItems = [
		{
			title: "Dashboard",
			id: "dashboard",
			icon: <LayoutDashboard className="h-4 w-4" />,
		},
		{
			title: "Meetings",
			id: "meetings",
			icon: <CalendarDays className="h-4 w-4" />,
		},
		{
			title: "Search Candidates",
			id: "search-candidates",
			icon: <Target className="h-4 w-4" />,
		},
		{
			title: "Follow Ups",
			id: "follow-ups",
			icon: <Mail className="h-4 w-4" />,
		},
	];

	// Filter nav items according to dynamic role permissions
	const mainNav = allNavItems.filter((item) =>
		allowed.includes(item.id)
	);

	return (
		<Sidebar
			className={cn(
				"*:data-[slot=sidebar-inner]:bg-background",
				"transition-[left,right,top,width] duration-200 ease-executive"
			)}
			collapsible="offcanvas"
			variant="sidebar"
		>
			<SidebarHeader className="h-(--app-header-height,3.5rem) flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800/60 px-4">
				<Button
					variant="ghost"
					onClick={() => {
						const defaultPage = roleConfig.allowedPages.includes("dashboard") ? "dashboard" : "meetings";
						onSelectPage(defaultPage);
					}}
					nativeButton={true}
					className="flex items-center gap-2.5 px-1 hover:bg-transparent max-w-[200px] overflow-hidden text-left"
				>
					<LogoIcon />
					<div className="flex flex-col text-left truncate">
						<span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight leading-none truncate">
							{whiteLabelConfig.isCustomized ? whiteLabelConfig.companyName : "Avantty"}
						</span>
						<span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-0.5 truncate">
							{whiteLabelConfig.isCustomized ? "Enterprise Portal" : "Enterprise"}
						</span>
					</div>
				</Button>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<AppSearch onNavigate={onSelectPage} />
				</SidebarGroup>

				{/* Primary Recruitment Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						Recruitment App
					</SidebarGroupLabel>
					<SidebarMenu>
						{mainNav.map((item) => (
							<SidebarMenuItem key={item.id}>
								<SidebarMenuButton
									isActive={activePage === item.id}
									tooltip={item.title}
									onClick={() => onSelectPage(item.id)}
									className="cursor-pointer"
								>
									{item.icon}
									<span className="font-medium text-sm">{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>

				{/* System Groups */}
				{allowed.includes("logs") && (
					<SidebarGroup>
						<SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							System
						</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={activePage === "logs"}
									tooltip="Activity Logs"
									onClick={() => onSelectPage("logs")}
									className="cursor-pointer"
								>
									<ScrollText className="h-4 w-4" />
									<span className="font-medium text-sm">Logs</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}
			</SidebarContent>

			<SidebarFooter className="px-4 border-t border-slate-100 dark:border-slate-800 pt-2 pb-2">
				<div className="flex items-center justify-between">
					<ThemeSwitcher />
					{currentRole === "CEO" && (
						<Button
							className="text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
							size="icon-sm"
							variant="ghost"
							aria-label="Settings"
							onClick={onOpenSettings}
						>
							<SettingsIcon className="h-4 w-4" />
						</Button>
					)}
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

