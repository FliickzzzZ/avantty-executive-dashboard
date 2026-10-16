import { CustomTrigger } from "@/components/custom-trigger";
import { NavUser } from "@/components/nav-user";
import { UserRole } from "@/src/types";
import { useAppData } from "@/src/app-data-context";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";

interface AppHeaderProps {
	activePage: string;
	currentRole: UserRole;
	onRoleChange: (role: UserRole) => void;
	onLogout?: () => void;
	onSelectPage?: (page: string) => void;
	onOpenSettings?: () => void;
}

export function AppHeader({ activePage, currentRole, onRoleChange, onLogout, onSelectPage, onOpenSettings }: AppHeaderProps) {
	const { whiteLabelConfig, resetWhiteLabelConfig, setIsDemoModalOpen } = useAppData();

	return (
		<header className="sticky top-0 z-40 flex h-(--app-header-height) w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-md text-foreground px-4 md:px-6 transition-colors">
			<div className="flex items-center gap-3">
				<CustomTrigger place="navbar" />
				<div className="flex items-center gap-2">
					<span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-0.5 text-xs font-bold text-foreground border border-border tracking-wide">
						{whiteLabelConfig.isCustomized ? (
							<>
								<span className="h-1.5 w-1.5 rounded-full bg-[#00875A] animate-pulse" />
								<span>{whiteLabelConfig.companyName}</span>
								{!whiteLabelConfig.isClientView && (
									<span className="text-[10px] text-muted-foreground font-medium">Demo Mode</span>
								)}
							</>
						) : (
							<span>Avantty Enterprise</span>
						)}
					</span>

					{whiteLabelConfig.isCustomized && !whiteLabelConfig.isClientView && (
						<button
							type="button"
							onClick={resetWhiteLabelConfig}
							title="Restablecer a Avantty (Naim Ramos)"
							className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-[#00875A] bg-secondary px-2 py-0.5 rounded border border-border transition-colors cursor-pointer"
						>
							<RotateCcw className="h-2.5 w-2.5" />
							<span>Restablecer a Avantty</span>
						</button>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2.5">
				{/* 10-Second Demo & Share Link Customizer Trigger (Hidden in Client View Link) */}
				{!whiteLabelConfig.isClientView && (
					<Button
						type="button"
						onClick={() => setIsDemoModalOpen(true)}
						size="sm"
						className="h-8 gap-1.5 px-3 text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-95"
					>
						<Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
						<span className="hidden md:inline">Personalizar Demo (10s)</span>
						<span className="md:hidden">Demo</span>
					</Button>
				)}

				<NavUser currentRole={currentRole} onRoleChange={onRoleChange} onLogout={onLogout} onOpenSettings={onOpenSettings} />
			</div>
		</header>
	);
}
