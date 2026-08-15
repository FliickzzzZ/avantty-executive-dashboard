"use client";

import { useState } from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole, ROLE_CONFIGS } from "@/src/types";
import { SettingsIcon, Shield, LogOutIcon, Check } from "lucide-react";
import { EnterpriseSettingsModal } from "@/components/enterprise-settings-modal";
import { useAppData, getDynamicUser } from "@/src/app-data-context";

interface NavUserProps {
	currentRole: UserRole;
	onRoleChange: (role: UserRole) => void;
	onLogout?: () => void;
	onOpenSettings?: () => void;
}

export function NavUser({ currentRole, onRoleChange, onLogout, onOpenSettings }: NavUserProps) {
	const { whiteLabelConfig } = useAppData();
	const currentUser = getDynamicUser(currentRole, whiteLabelConfig);
	const currentRoleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.CEO;

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
					<Avatar className="size-8 border border-slate-200 dark:border-slate-700">
						<AvatarImage src={currentUser.avatar} />
						<AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:inline-block">
						{currentRole}
					</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" sideOffset={8} className="w-64 p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl ease-executive">
					<DropdownMenuGroup>
						<DropdownMenuLabel className="flex items-center gap-3 p-2">
							<Avatar className="size-10 border border-slate-200 dark:border-slate-700">
								<AvatarImage src={currentUser.avatar} />
								<AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="space-y-0.5">
								<span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">{currentUser.name}</span>
								<div className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[150px]">
									{currentUser.email}
								</div>
								<span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mt-1">
									{currentRoleConfig.badgeText}
								</span>
							</div>
						</DropdownMenuLabel>
					</DropdownMenuGroup>
					
					<DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />

					{/* Switch Roles Section */}
					<div className="px-2 py-1.5">
						<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
							Switch Role
						</span>
						<div className="space-y-1">
							{(["CEO", "Recruiter", "Sourcer"] as UserRole[]).map((r) => {
								const isCurrent = currentRole === r;
								return (
									<button
										key={r}
										onClick={() => onRoleChange(r)}
										className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
											isCurrent
												? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold"
												: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
										}`}
									>
										<div className="flex items-center gap-2">
											<Shield className={`h-3.5 w-3.5 ${isCurrent ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`} />
											<span>{r}</span>
										</div>
										{isCurrent && <Check className="h-3.5 w-3.5 text-slate-900 dark:text-white" />}
									</button>
								);
							})}
						</div>
					</div>

					{currentRole === "CEO" && (
						<>
							<DropdownMenuSeparator className="bg-slate-200 dark:border-slate-800" />
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={() => {
										if (onOpenSettings) {
											onOpenSettings();
										} else {
											setIsSettingsOpen(true);
										}
									}}
									className="text-xs cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
								>
									<SettingsIcon className="h-3.5 w-3.5 mr-2 text-slate-400" />
									Enterprise Settings
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</>
					)}
					<DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
					<DropdownMenuGroup>
						<DropdownMenuItem
							className="w-full cursor-pointer text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40"
							onClick={onLogout}
						>
							<LogOutIcon className="h-3.5 w-3.5 mr-2" />
							Sign Out
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<EnterpriseSettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				currentRole={currentRole}
				onRoleChange={onRoleChange}
			/>
		</>
	);
}
