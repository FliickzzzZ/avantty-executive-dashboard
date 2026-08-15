import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { EnterpriseSettingsModal } from "@/components/enterprise-settings-modal";
import { UserRole } from "@/src/types";

interface AppShellProps {
	children: React.ReactNode;
	activePage: string;
	currentRole: UserRole;
	onSelectPage: (page: string) => void;
	onRoleChange: (role: UserRole) => void;
	onLogout?: () => void;
}

export function AppShell({ children, activePage, currentRole, onSelectPage, onRoleChange, onLogout }: AppShellProps) {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	return (
		<SidebarProvider
			className={cn(
				"[--app-wrapper-max-width:80rem]",
				"[--app-header-height:3.5rem]"
			)}
		>
			<AppSidebar
				activePage={activePage}
				currentRole={currentRole}
				onSelectPage={onSelectPage}
				onOpenSettings={() => setIsSettingsOpen(true)}
			/>
			<SidebarInset className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors flex flex-col">
				<AppHeader
					activePage={activePage}
					currentRole={currentRole}
					onRoleChange={onRoleChange}
					onLogout={onLogout}
					onSelectPage={onSelectPage}
					onOpenSettings={() => setIsSettingsOpen(true)}
				/>
				<main
					className={cn(
						"flex flex-1 flex-col p-4 md:p-6",
						"mx-auto w-full max-w-(--app-wrapper-max-width)"
					)}
				>
					{children}
				</main>
			</SidebarInset>

			<EnterpriseSettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				currentRole={currentRole}
				onRoleChange={onRoleChange}
			/>
		</SidebarProvider>
	);
}
