"use client"
import React, { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import CreateStepModal from "@/containers/Cv/pages/CreateStepModal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Edit, Replace, Search, Trash } from "lucide-react"
import { useSteps, useDeleteStep, useEditStepStatus } from "@/lib/hooks/useStep"
import AlertDialogComponent from "@/components/AlertDiolog/AlertDiolog"
import StepsReorderDialog from "@/containers/Cv/pages/StepsReorderDialog"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"

export default function StepContainer() {
	const [open, setOpen] = useState(false)
	const [editId, setEditId] = useState<number | null>(null)
	const [pageNumber, setPageNumber] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [reorderOpen, setReorderOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)
	const [searchInput, setSearchInput] = useState("")
	const [search, setSearch] = useState("")
	const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all')

	React.useEffect(() => {
		const h = setTimeout(() => setSearch(searchInput.trim()), 500)
		return () => clearTimeout(h)
	}, [searchInput])

	const queryParams = {
		pageNumber,
		pageSize,
		value: search || undefined,
		isActive: statusFilter === 'all' ? undefined : statusFilter === 'true'
	}

	const { data: steps = [], isLoading, isError } = useSteps(queryParams)

	const { data: nextPageSteps = [] } = useSteps(
		{ ...queryParams, pageNumber: pageNumber + 1 },
		{ enabled: steps.length === pageSize }
	)

	const canGoNext = steps.length === pageSize && nextPageSteps.length > 0

	useEffect(() => {
		if (!isLoading && !isError && steps.length === 0 && pageNumber > 1) {
			setPageNumber(p => Math.max(1, p - 1))
		}
	}, [steps, isLoading, isError, pageNumber])

	const deleteStep = useDeleteStep()
	const editStatus = useEditStepStatus()
	const t = useTranslations("step")

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold">{t("title")}</h2>
				<div className="flex items-center gap-2">
					<Button
						className="text-white flex items-center justify-center h-10 w-10 p-0"
						style={{ backgroundColor: "#f39f40ff", transition: "background-color 0.3s" }}
						onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2aa69ff")}
						onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f39f40ff")}
						title="Sıralama"
						onClick={() => setReorderOpen(true)}
					>
						<Replace className="h-5 w-5" />
					</Button>
					<Button
						onClick={() => { setEditId(null); setOpen(true) }}
						className="text-white"
						style={{ backgroundColor: "#f34040ff", transition: "background-color 0.3s" }}
						onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd6060cc")}
						onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f34040ff")}
					>{t("addStep")}</Button>
				</div>
			</div>
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
				<div className="relative w-full sm:w-1/2 lg:w-1/3">
					<Input
						value={searchInput}
						onChange={(e) => { setSearchInput(e.target.value); setPageNumber(1) }}
						placeholder={t("search_placeholder") || "Axtar..."}
						className="bg-white dark:bg-background pl-3 h-10"
					/>
					<Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				</div>
				<div className="flex gap-2 w-56">
					<Dropdown
						className="w-full"
						options={[
							{ value: 'all', label: t("all") || "Hamısı" },
							{ value: 'true', label: t("active") || "Aktiv" },
							{ value: 'false', label: t("passive") || "Passiv" },
						]}
						value={statusFilter}
						onChange={(val: string) => { setStatusFilter(val as any); setPageNumber(1) }}
					/>
				</div>
			</div>
			<div className="border rounded-lg overflow-hidden mb-4">
				<Table className="text-sm w-full">
					<TableHeader>
						<TableRow className="bg-gray-50 hover:bg-gray-50">
							<TableHead className="px-3 py-2 text-lg">ID</TableHead>
							<TableHead className="px-3 py-2 text-lg">Ad</TableHead>
							<TableHead className="px-3 py-2 text-lg">Kontekst</TableHead>
							<TableHead className="px-3 py-2 text-lg">Sıra</TableHead>
							<TableHead className="px-3 py-2 text-lg">Sections</TableHead>
							<TableHead className="px-3 py-2 text-lg">Status</TableHead>
							<TableHead className="px-3 py-2 text-right sticky right-0 bg-white/90 backdrop-blur z-10">Əməliyyatlar</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && (
							<TableRow>
								<TableCell colSpan={7} className="px-3 py-6 text-center">Yüklənir...</TableCell>
							</TableRow>
						)}
						{isError && (
							<TableRow>
								<TableCell colSpan={7} className="px-3 py-6 text-center text-red-600">Xəta baş verdi</TableCell>
							</TableRow>
						)}
						{!isLoading && !isError && steps.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="px-3 py-6 text-center text-muted-foreground">Məlumat yoxdur</TableCell>
							</TableRow>
						)}
						{!isLoading && !isError && steps.map((s: any) => (
							<TableRow key={s.id}>
								<TableCell className="px-3 py-4 text-base">{s.id}</TableCell>
								<TableCell className="px-3 py-4 text-base font-medium">{s.name}</TableCell>
								<TableCell className="px-3 py-4 text-base">
									{s.context === 1 ? 'Cv' : s.context === 2 ? 'Vakansiya' : '-'}
								</TableCell>
								<TableCell className="px-3 py-4 text-base">{s.order}</TableCell>
								<TableCell className="px-3 py-4 text-base">{s.sections?.length ?? 0}</TableCell>
								<TableCell className="px-3 py-4">
									<Switch
										checked={!!s.isActive}
										disabled={editStatus.isPending}
										onCheckedChange={(val) => {
											editStatus.mutate({ id: s.id, isActive: val })
										}}
									/>
								</TableCell>
								<TableCell className="px-3 py-2 text-right sticky right-0 bg-white/90 backdrop-blur">
									<div className="inline-flex gap-2">
										<Edit
											className="w-5 h-5 cursor-pointer"
											onClick={() => { setEditId(s.id); setOpen(true) }}
										/>
										<Trash
											className="w-5 h-5 cursor-pointer text-red-600"
											onClick={() => { setDeleteId(s.id); setDeleteOpen(true) }}
										/>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between gap-4 mt-2">
				<div className="flex items-center gap-2 text-sm">
					<span>Səhifə ölçüsü:</span>
					<select
						className="border rounded px-2 py-1 text-sm"
						value={pageSize}
						onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1) }}
					>
						{[5, 10, 20, 50].map((sz) => (
							<option key={sz} value={sz}>{sz}</option>
						))}
					</select>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={pageNumber === 1 || isLoading}
						onClick={() => setPageNumber(p => Math.max(1, p - 1))}
					>
						<ChevronLeft />
					</Button>
					<span
						className="text-sm"
						style={{ width: "30px", alignItems: "center", display: "flex", justifyContent: "center" }}
					>{pageNumber}</span>
					<Button
						variant="outline"
						size="sm"
						disabled={isLoading || !canGoNext}
						onClick={() => setPageNumber(p => p + 1)}
					>
						<ChevronRight />
					</Button>
				</div>
			</div>

			<Dialog open={open} onOpenChange={(o) => { if (!o) setEditId(null); setOpen(o) }}>
				<DialogContent className="w-[80vw] max-w-[1200px] h-[70vh] overflow-y-auto">
					<CreateStepModal id={editId ?? undefined} onClose={() => { setOpen(false); setEditId(null) }} />
				</DialogContent>
			</Dialog>

			<StepsReorderDialog open={reorderOpen} onOpenChange={setReorderOpen} />

			<AlertDialogComponent
				open={deleteOpen}
				setOpen={(o) => { if (!o) setDeleteId(null); setDeleteOpen(o) }}
				title={t("deleteTitle")}
				description={t("deleteDescription")}
				onCancel={() => { setDeleteOpen(false); setDeleteId(null) }}
				onConfirm={() => {
					if (deleteId != null) {
						deleteStep.mutate(deleteId, {
							onSettled: () => {
								setDeleteOpen(false)
								setDeleteId(null)
							}
						})
					}
				}}
			/>
		</div>
	)
}