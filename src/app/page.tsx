"use client";

import React from "react";
import { CheckCircle, Flag05, Stars02, User01, UsersPlus, X, File01, UploadCloud02, Download01, Trash01, Mail01 } from "@untitledui/icons";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Progress } from "@/components/application/progress-steps/progress-steps";
import type { ProgressFeaturedIconType } from "@/components/application/progress-steps/progress-types";
import { type DateValue, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import { AppHeader } from "@/components/application/app-header";
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Toggle } from "@/components/base/toggle/toggle";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icons";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { useState, useEffect } from "react";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { FileIcon } from "@untitledui/file-icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Badge } from "@/components/base/badges/badges";
import { Tag, TagGroup, TagList } from "@/components/base/tags/tags";
import { PaginationButtonGroup } from "@/components/application/pagination/pagination";



// Employee data types - matching BigQuery Employee_List view structure
interface Employee {
    employee_code: string;  // EmployeeCode from Employee_List
    employee_name: string;  // EmployeeName from Employee_List
    employee_id?: number;   // lEmpId from Employee_Details (optional)
    department?: string;    // Department from Employee_Details (optional)
    job_title?: string;     // Designation from Employee_Details (optional)
    branch?: string;        // BranchName from Employee_Details (optional)
}

// Report history interface
interface ReportItem {
    name: string;
    fileType: string;
    size: string;
    uploadedAt: string;
    updatedAt: string;
    uploadedBy: string;
    // Store generation parameters for re-downloading
    generationParams?: {
        customerName: string;
        reportDate: string;
        selectedEmployees: Employee[];
        selectedCategories: any;
        reportFormat: string;
    };
}

// Load reports from localStorage or initialize empty
const getStoredReports = (): ReportItem[] => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('reportHistory');
        return stored ? JSON.parse(stored) : [];
    }
    return [];
};

// Modal data structure
const modalData = {
    personalInfo: [
        { id: 'first-name', label: 'First Name', selected: false },
        { id: 'second-name', label: 'Second Name', selected: false },
        { id: 'last-name', label: 'Last Name', selected: false },
        { id: 'full-name-english', label: 'Full Name English', selected: false },
        { id: 'full-name-arabic', label: 'Full Name Arabic', selected: false },
        { id: 'date-of-birth', label: 'Date of Birth', selected: false },
        { id: 'place-of-birth', label: 'Place Of Birth', selected: false },
        { id: 'nationality', label: 'Nationality', selected: false },
        { id: 'gender', label: 'Gender', selected: false },
        { id: 'language', label: 'Language', selected: false }
    ],
    employmentInfo: [
        { id: 'job-title', label: 'Job Title', selected: false },
        { id: 'department', label: 'Department', selected: false },
        { id: 'date-of-joining', label: 'Date of Joining', selected: false },
        { id: 'contact-no', label: 'Contact No', selected: false },
        { id: 'residence-location', label: 'Residence Location', selected: false },
    ],
    passportInfo: [
        { id: 'passport-no', label: 'Passport Number', selected: false },
        { id: 'passport-issue-country', label: 'Passport Issue Country', selected: false },
        { id: 'passport-issue-date', label: 'Passport Issue Date', selected: false },
        { id: 'passport-expiry-date', label: 'Passport Expiry Date', selected: false },
    ],
    visaInfo: [
        { id: 'visa-no', label: 'Visa Number', selected: false },
        { id: 'visa-issue-place', label: 'Visa Issue Place', selected: false },
        { id: 'visa-issue-date', label: 'Visa Issue date', selected: false },
        { id: 'visa-expiry-date', label: 'Visa Expiry date', selected: false },
    ],
    eidInfo: [
        { id: 'emirates-id-no', label: 'Emirates ID Number', selected: false },
        { id: 'emirates-id-issue-date', label: 'Emirates ID Issue Date', selected: false },
        { id: 'emirates-id-expiry-date', label: 'Emirates ID Expiry Date', selected: false },
    ],
    molInfo: [
        { id: 'mol-number', label: 'MOL Number', selected: false },
        { id: 'mol-issue-date', label: 'MOL Issue Date', selected: false },
        { id: 'mol-expiry-date', label: 'MOL Expiry Date', selected: false },
    ],
    insuranceInfo: [
        { id: 'insurance-type', label: 'Insurance Type', selected: false },
        { id: 'insurance-issue-date', label: 'Insurance Issue Date', selected: false },
        { id: 'insurance-expiry-date', label: 'Insurance Expiry Date', selected: false },
    ],
    createReport: [
        { id: 'export-zip', label: 'Export as .zip', selected: false, disabled: true },
        { id: 'export-pdf', label: 'Export as .pdf', selected: false, disabled: true },
        { id: 'export-xlsx', label: 'Export as .xlsx', selected: false },
    ],
};

const ModalComponent = ({ isOpen, onClose, title, items, onToggle, onConfirm, confirmButtonText = "Confirm" }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: { id: string; label: string; selected: boolean; disabled?: boolean }[];
    onToggle: (id: string) => void;
    onConfirm: () => void;
    confirmButtonText?: string;
}) => {
    const isSelectableModal = !["Employee Selection", "Create Report"].includes(title);
    return (
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={onClose}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-100">
                            <CloseButton onClick={() => onClose()} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <FeaturedIcon color="brand" size="lg" theme="light" icon={CheckCircle} className="bg-[#56B3E5] text-white" />
                                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                            <div className="relative flex flex-col gap-0.5">
                                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                                        {title}
                                    </AriaHeading>
                                    <p className="hidden text-sm text-tertiary sm:flex">
                                        Complete the items below for {title.toLowerCase()}. Toggle each item that applies to your situation.
                                    </p>
                                    <p className="text-sm text-tertiary sm:hidden">
                                        Complete the items below for {title.toLowerCase()}.
                                    </p>
                                {isSelectableModal && (
                                    <div className="mt-2">
                                        <Toggle
                                            size="sm"
                                            label="Select all"
                                                                        onChange={() => {
                                items.forEach((it) => {
                                    if (!it.selected && !it.disabled) onToggle(it.id);
                                });
                            }}
                                        />
                                    </div>
                                )}
                                </div>
                            </div>
                            <div className="h-5 w-full" />
                            <div className="relative flex flex-col gap-3 px-4 sm:px-6 max-h-96 overflow-y-auto">
                                {items.map((item) => (
                                    <Toggle 
                                        key={item.id}
                                        id={item.id} 
                                        size="sm" 
                                        label={item.label}
                                        defaultSelected={item.selected}
                                        isDisabled={(item as any).disabled}
                                        onChange={() => onToggle(item.id)}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
                                <Button color="secondary" size="md" onClick={() => onClose()}>
                                    Clear All
                                </Button>
                                <Button color="primary" size="md" onClick={() => onConfirm()}>
                                    {confirmButtonText}
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </AriaDialogTrigger>
    );
};

// Employee Search Modal Component
const EmployeeSearchModal = ({
    selectedEmployees,
    searchTerm,
    setSearchTerm,
    searchResults,
    handleEmployeeSearch,
    handleEmployeeSelect,
    removeEmployee,
    clearAllEmployees,
    onClose,
    isSearching
}: {
    selectedEmployees: Employee[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    searchResults: Employee[];
    handleEmployeeSearch: (value: string) => void;
    handleEmployeeSelect: (id: string) => void;
    removeEmployee: (id: string) => void;
    clearAllEmployees: () => void;
    onClose: () => void;
    isSearching: boolean;
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(selectedEmployees.length / itemsPerPage);
    
    // Reset to last page if current page is out of bounds
    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedEmployees = selectedEmployees.slice(startIndex, endIndex);
    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl border border-gray-200 transition-all sm:max-w-100 md:min-h-[36rem]">
            <CloseButton onClick={onClose} theme="light" size="lg" className="absolute top-3 right-3" />
            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                <div className="relative w-max">
                    <FeaturedIcon color="brand" size="lg" theme="light" icon={UsersPlus} className="bg-[#56B3E5] text-white" />
                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="z-10 flex flex-col gap-0.5">
                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                        Select Employees
                    </AriaHeading>
                    
                </div>
            </div>
            <div className="h-5 w-full" />
            <div className="flex flex-col gap-6 px-4 sm:px-6">
                {/* Employee Search Section */}
                <div className="w-full">
                    <div className="relative">
                        <Input
                            placeholder="Search by employee ID or name..."
                            value={searchTerm}
                            onChange={(value: string) => handleEmployeeSearch(value)}
                            className="w-full"
                        />
                        {searchResults.length > 0 && searchTerm.length >= 2 && (
                            <div className="absolute top-full mt-2 w-full bg-primary border border-gray-200 rounded-lg shadow-lg z-10 max-h-[36rem] overflow-y-auto">
                                {isSearching ? (
                                    <div className="px-4 py-3 text-center text-sm text-tertiary">
                                        Searching...
                                    </div>
                                ) : (
                                    searchResults.map((employee) => (
                                        <button
                                            key={employee.employee_id || employee.employee_code}
                                            onClick={() => handleEmployeeSelect(employee.employee_code)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="text-sm text-primary">
                                                {employee.employee_code} - {employee.employee_name}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Employees Table */}
                <div className="w-full">
                    {selectedEmployees.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head isRowHeader className="text-xs py-1">ID</Table.Head>
                                            <Table.Head className="text-xs py-1">Name</Table.Head>
                                            <Table.Head className="text-xs w-10 py-1"></Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {displayedEmployees.map((employee) => (
                                            <Table.Row key={employee.employee_id || employee.employee_code} className="h-8">
                                                <Table.Cell className="text-xs font-medium py-0.5">{employee.employee_code}</Table.Cell>
                                                <Table.Cell className="text-xs py-0.5">{employee.employee_name}</Table.Cell>
                                                <Table.Cell className="py-0.5">
                                                    <CloseButton 
                                                        onClick={() => removeEmployee(employee.employee_code)}
                                                        size="xs"
                                                        theme="light"
                                                    />
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-4">
                                    <PaginationButtonGroup 
                                        align="right" 
                                        page={currentPage} 
                                        total={totalPages}
                                        onPageChange={setCurrentPage} 
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                    <EmptyState title="No employees selected">
                    </EmptyState>
                    )}
                </div>
            </div>
            <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
                <Button 
                    color="secondary" 
                    size="lg"
                    onClick={clearAllEmployees}
                    disabled={selectedEmployees.length === 0}
                >
                    Clear All
                </Button>
                <Button 
                    color="primary" 
                    size="lg"
                    onClick={onClose}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

// Inline Expanded Section Component
const InlineExpandedSection = ({ 
    stepIndex,
    items, 
    title, 
    onToggle, 
    onConfirm,
    onClear,
    onClose,
    confirmButtonText = "Next"
}: { 
    stepIndex: number;
    items: typeof modalData.personalInfo; 
    title: string; 
    onToggle: (itemId: string) => void;
    onConfirm: () => void;
    onClear: () => void;
    onClose: () => void;
    confirmButtonText?: string;
}) => {
    const allSelected = items.filter(it => !(it as any).disabled).every((it) => it.selected);
    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl border border-gray-200 transition-all sm:max-w-100">
            <CloseButton onClick={onClose} theme="light" size="lg" className="absolute top-3 right-3" />
            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                <div className="relative w-max">
                    <FeaturedIcon color="brand" size="lg" theme="light" icon={CheckCircle} className="bg-[#56B3E5] text-white" />
                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="z-10 flex flex-col gap-0.5">
                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                        {title}
                    </AriaHeading>
                    {title !== "Create Report" && (
                        <p className="text-sm text-tertiary">
                            Select the fields you want to include in your report
                        </p>
                    )}
                </div>
            </div>
            <div className="h-5 w-full" />
            <div className="flex flex-col gap-3 px-4 sm:px-6">
                {(["Personal Info", "Employment Info", "Passport Info", "Visa Info", "EID Info", "MOL Info", "Insurance Info"].includes(title)) && (
                    <div className="mb-1">
                        <div className="flex items-start gap-3">
                            <Toggle
                                size="sm"
                                aria-label="Select all"
                                isSelected={allSelected}
                                onChange={(next) => {
                                    if (next) {
                                        items.forEach((it) => {
                                            if (!it.selected && !(it as any).disabled) onToggle(it.id);
                                        });
                                    } else {
                                        items.forEach((it) => {
                                            if (it.selected && !(it as any).disabled) onToggle(it.id);
                                        });
                                    }
                                }}
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-[#56B3E5]">Select all</div>
                            </div>
                        </div>
                    </div>
                )}
                {items.map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                        <Toggle
                            isSelected={item.selected}
                            isDisabled={(item as any).disabled}
                            onChange={() => onToggle(item.id)}
                            size="sm"
                        />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-primary">{item.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
                <Button color="secondary" size="lg" onClick={onClear}>
                    Clear All
                </Button>
                <Button color="primary" size="lg" onClick={onConfirm}>
                    {confirmButtonText}
                </Button>
            </div>
        </div>
    );
};

// Reports History Table Component
const ReportsHistoryTable = ({ reportHistory, onDeleteReport, onDownloadReport, setToastMessage, setToastType, setShowToast }: { 
    reportHistory: ReportItem[]; 
    onDeleteReport: (reportName: string) => void;
    onDownloadReport: (reportItem: ReportItem) => void;
    setToastMessage: (message: string) => void;
    setToastType: (type: 'success' | 'error' | 'info') => void;
    setShowToast: (show: boolean) => void;
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Calculate pagination
    const totalItems = reportHistory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = reportHistory.slice(startIndex, endIndex);

    const totalReports = reportHistory.length;
    const now = new Date();
    const totalMTD = reportHistory.filter((it) => {
        const d = new Date(it.uploadedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const totalDownloads = 0;
    const totalEmails = 0;
    const secondsPerReport = 2 * 3600 + 59 * 60; // 2:59:00 per report
    const totalTimeSavedSeconds = totalReports * secondsPerReport;
    const totalTimeSavedHrs = Math.floor(totalTimeSavedSeconds / 3600);
    const totalValueEarnedRaw = totalTimeSavedHrs * 17;
    const totalValueEarned = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(totalValueEarnedRaw);

    return (
        <TableCard.Root>
            <TableCard.Header
                className="py-[0.6875rem] md:items-center"
                contentTrailing={
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary ring-1 ring-secondary px-3 py-2 min-w-28">
                            <div className="text-xs text-tertiary">Total Reports</div>
                            <div className="text-lg font-semibold text-primary leading-6">{totalReports}</div>
                        </div>
                        <div className="rounded-lg bg-primary ring-1 ring-secondary px-3 py-2 min-w-28">
                            <div className="text-xs text-tertiary">Total MTD</div>
                            <div className="text-lg font-semibold text-primary leading-6">{totalMTD}</div>
                        </div>
                        <div className="rounded-lg bg-primary ring-1 ring-secondary px-3 py-2 min-w-28">
                            <div className="text-xs text-tertiary">Total Downloads</div>
                            <div className="text-lg font-semibold text-primary leading-6">{totalDownloads}</div>
                        </div>
                        <div className="rounded-lg bg-primary ring-1 ring-secondary px-3 py-2 min-w-28">
                            <div className="text-xs text-tertiary">Total Emails</div>
                            <div className="text-lg font-semibold text-primary leading-6">{totalEmails}</div>
                        </div>
                        <div className="rounded-lg bg-primary ring-1 ring-secondary px-3 py-2 min-w-28">
                            <div className="text-xs text-tertiary">Time Saved</div>
                            <div className="text-lg font-semibold text-primary leading-6">{totalTimeSavedHrs} hrs</div>
                        </div>
                        <div className="rounded-lg bg-primary ring-1 ring-secondary px-3 py-2 min-w-28">
                            <div className="text-xs text-tertiary">Value Earned</div>
                            <div className="text-lg font-semibold text-primary leading-6">{totalValueEarned}</div>
                        </div>
                    </div>
                }
                description="Download to view previous reports"
                title={
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
                            <path fill="#E7B95E" d="M44.8 2.3h-23c-1 0-1.9.5-2.5 1.2L18 5.1c-.6.8-1.5 1.2-2.5 1.2H3.2C1.4 6.3 0 7.7 0 9.5v27.6c0 1.8 1.4 3.2 3.2 3.2h41.6c1.8 0 3.2-1.4 3.2-3.2V5.5c0-1.8-1.4-3.2-3.2-3.2z"></path>
                            <path fill="#FFF" d="M44.2 8.5H3.8c-1 0-1.8.8-1.8 1.8v12c0 1 .8 1.8 1.8 1.8h40.5c1 0 1.8-.8 1.8-1.8v-12c-.1-1-.9-1.8-1.9-1.8z"></path>
                            <path fill="#FFCC67" d="M44.8 15.7H19c-1.1 0-2.1-.6-2.7-1.5l-1.3-2c-.6-.9-1.6-1.5-2.7-1.5H3.2c-1.8 0-3.2 1.4-3.2 3.2v28.6c0 1.8 1.4 3.2 3.2 3.2h41.6c1.8 0 3.2-1.4 3.2-3.2V18.9c0-1.7-1.4-3.2-3.2-3.2z"></path>
                            <path fill="#ED7161" d="m39.7 34-4.4-4.3L31 34V15.7h8.7z"></path>
                        </svg>
                        Report History
                    </span>
                }
            />
            {reportHistory.length === 0 ? (
                <div className="py-12">
                    <EmptyState>
                        <EmptyState.Header>
                            <EmptyState.FeaturedIcon icon={File01} color="brand" />
                        </EmptyState.Header>
                        <EmptyState.Content>
                            <EmptyState.Title>No reports yet</EmptyState.Title>
                            <EmptyState.Description>Create your first report by filling out the form above and going through the process tracker.</EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                </div>
            ) : (
                <>
                    <Table aria-label="Report history">
                        <Table.Header>
                            <Table.Head id="name" label="File name" isRowHeader />
                            <Table.Head id="type" label="File type" />
                            <Table.Head id="size" label="File size" />
                            <Table.Head id="uploadedAt" label="Date created" />
                            <Table.Head id="uploadedBy" label="Created by" />
                            <Table.Head id="actions" label="Actions" className="text-left" />
                        </Table.Header>
                        <Table.Body items={currentItems} className="[&>tr:last-child>td]:after:hidden">
                    {(item) => (
                        <Table.Row id={item.name}>
                            <Table.Cell>
                                <div className="flex items-center gap-3">
                                    <div className="whitespace-nowrap">
                                        <p className="text-xs font-medium text-tertiary">{item.name}</p>
                                    </div>
                                </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap text-xs">
                                {item.fileType === '.pdf' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
                                        <path fill="#d84200" d="M128.06,22.6L23.18,127.48C10.2,140.46,2.91,158.07,2.91,176.43v1.8c0-26.17,21.22-47.39,47.39-47.39h81.12V49.72c0-26.17,21.22-47.39,47.39-47.39h-1.8C158.65,2.32,141.04,9.62,128.06,22.6z"></path>
                                        <path fill="#ebf2ff" d="M2.91,176.43v1.8c0-26.17,21.22-47.39,47.39-47.39h81.12V49.72c0-26.17,21.22-47.39,47.39-47.39h197.75v510.8H2.91V176.43z"></path>
                                        <linearGradient id="SVGID_1_" x1="377.714" x2="103.915" y1="512.455" y2="38.222" gradientUnits="userSpaceOnUse">
                                            <stop offset=".001" stopColor="#ebf2ff"></stop>
                                            <stop offset="1" stopColor="#c8d6e8"></stop>
                                        </linearGradient>
                                        <path fill="url(#SVGID_1_)" d="M178.81,2.32c-26.17,0-47.39,21.22-47.39,47.39v81.12H50.3c-26.17,0-47.39,21.22-47.39,47.39l373.65,334.9V195.49L179.57,2.32H178.81z"></path>
                                        <rect width="374.91" height="158.55" x="136.58" y="311.17" fill="#d84200"></rect>
                                        <path fill="#fff" d="M226.64 350.36c5.95-1.01 14.31-1.77 26.09-1.77 11.9 0 20.39 2.28 26.09 6.84 5.45 4.31 9.12 11.4 9.12 19.76 0 8.36-2.79 15.45-7.85 20.26-6.59 6.21-16.34 8.99-27.74 8.99-2.53 0-4.81-.13-6.59-.38v30.52h-19.12V350.36zM245.76 389.12c1.65.38 3.67.51 6.46.51 10.26 0 16.59-5.19 16.59-13.93 0-7.85-5.45-12.54-15.07-12.54-3.93 0-6.59.38-7.98.76V389.12zM300.22 350.36c7.09-1.14 16.34-1.77 26.09-1.77 16.21 0 26.72 2.91 34.96 9.12 8.87 6.59 14.44 17.1 14.44 32.17 0 16.34-5.95 27.61-14.18 34.58-8.99 7.47-22.67 11.02-39.39 11.02-10.01 0-17.1-.63-21.91-1.27V350.36zM319.6 420.02c1.65.38 4.31.38 6.71.38 17.48.13 28.88-9.5 28.88-29.89.13-17.73-10.26-27.1-26.85-27.1-4.31 0-7.09.38-8.74.76V420.02zM388.38 349.22h52.18v15.83h-32.8v19.5h30.65v15.7h-30.65v34.32h-19.38V349.22z"></path>
                                        <g>
                                            <path fill="#d84200" d="M110.35,281.54L110.35,281.54c-2.48-0.81-4.6-2.4-6.14-4.59c-5.6-8.01-4.57-14.53-2.71-18.6c5.11-11.19,23.45-18.64,54.55-22.16c18.44-20,38.15-45.63,52.17-67.84c-2.04-17.83-2.37-40.2,6.54-50.34c3.12-3.55,6.37-6,10.93-6.02c1.8-0.01,6.14,0.65,7.65,1.15c3.6,1.18,5.24,6.85,6.54,10.43c1.23,3.37,4.13,10.62-18.57,47.66c3.11,23.02,10.1,47.72,18.62,65.85c9.91,1.38,18.24,3.15,24.8,5.3c11.17,3.66,17.09,8.49,18.09,14.76c0.83,5.19-1.81,10.07-7.83,14.5c-5.8,4.26-12.24,5.4-18.62,3.31c-8.68-2.84-16.98-11.63-24.7-26.15c-21.63-2.4-47.74-2.6-69.58-0.51c-10.11,10.7-19.17,19.02-26.94,24.76C124.46,280.87,116.59,283.58,110.35,281.54z M141.33,251.19c-18.06,3.57-26.58,8.58-28.33,12.4c-0.29,0.63-1.05,2.3,1.46,5.95C115.63,269.54,122.76,268.75,141.33,251.19z M249.01,251.39c4.35,6.38,5.03,9.11,8.83,10.35c1.67,0.55,6.45,2.04,9.66-0.32c1.55-1.14,2.28-1.96,2.61-2.42c-0.73-0.75-1.58-2.07-7.92-4.15C258.59,253.67,254.01,252.35,249.01,251.39z M211.11,186.96c-10.89,15.98-23.87,32.83-36.77,47.71c16.81-0.9,34.67-0.64,51.07,0.78C219.45,221.11,214.4,203.98,211.11,186.96z M226.57,125.17c-0.78,0.01-13.6,9.43-6.84,23.17C231.45,135.47,226.9,125.17,226.57,125.17z"></path>
                                        </g>
                                        <polygon fill="#b73204" points="376.56 252.25 511.5 311.17 376.56 311.17"></polygon>
                                    </svg>
                                ) : item.fileType === '.xlsx' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
                                        <polygon fill="#096635" points="374.66 257 509.61 315.92 374.66 315.92"></polygon>
                                        <path fill="#19bf70" d="M126.35,21.26L21.53,126.09C8.55,139.06,1.26,156.66,1.26,175.01v1.8c0-26.16,21.21-47.37,47.37-47.37h81.08V48.37C129.7,22.21,150.91,1,177.07,1h-1.8C156.92,1,139.33,8.29,126.35,21.26z"></path>
                                        <linearGradient id="SVGID_2_" x1="1.26" x2="177.073" y1="88.906" y2="88.906" gradientUnits="userSpaceOnUse">
                                            <stop offset="0" stopColor="#fff" stopOpacity="0"></stop>
                                            <stop offset=".113" stopColor="#d6f4e6" stopOpacity=".113"></stop>
                                            <stop offset=".287" stopColor="#9de4c2" stopOpacity=".287"></stop>
                                            <stop offset=".457" stopColor="#6ed7a5" stopOpacity=".457"></stop>
                                            <stop offset=".617" stopColor="#49cc8e" stopOpacity=".617"></stop>
                                            <stop offset=".765" stopColor="#2fc57d" stopOpacity=".765"></stop>
                                            <stop offset=".897" stopColor="#1fc173" stopOpacity=".897"></stop>
                                            <stop offset="1" stopColor="#19bf70"></stop>
                                        </linearGradient>
                                        <path fill="url(#SVGID_2_)" d="M126.35,21.26L21.53,126.09C8.55,139.06,1.26,156.66,1.26,175.01v1.8c0-26.16,21.21-47.37,47.37-47.37h81.08V48.37C129.7,22.21,150.91,1,177.07,1h-1.8C156.92,1,139.33,8.29,126.35,21.26z"></path>
                                        <path fill="#ebf2ff" d="M1.26,175.01v1.8c0-26.16,21.21-47.37,47.37-47.37h81.08V48.37C129.7,22.21,150.91,1,177.07,1h197.65v510.54H1.26V175.01z"></path>
                                        <rect width="374.72" height="158.47" x="137.28" y="315.53" fill="#19bf70"></rect>
                                        <g>
                                            <path fill="#fff" d="M277.99 442.33l-7.94-15.87c-3.25-6.12-5.33-10.67-7.81-15.74h-.26c-1.82 5.07-4.03 9.63-6.77 15.74l-7.29 15.87H225.3l25.37-44.37-24.46-43.33h22.77l7.68 16c2.6 5.33 4.55 9.63 6.64 14.57h.26c2.08-5.6 3.77-9.5 5.99-14.57l7.42-16h22.64l-24.72 42.81 26.02 44.89H277.99zM311.56 354.64h19.91v71.04h34.87v16.65h-54.78V354.64zM378.7 421.9c5.33 2.73 13.53 5.46 21.99 5.46 9.11 0 13.92-3.77 13.92-9.5 0-5.46-4.16-8.59-14.7-12.36-14.57-5.07-24.07-13.14-24.07-25.89 0-14.96 12.49-26.41 33.18-26.41 9.89 0 17.17 2.08 22.38 4.42l-4.42 16c-3.51-1.69-9.76-4.16-18.35-4.16s-12.75 3.9-12.75 8.46c0 5.6 4.94 8.07 16.26 12.36 15.48 5.72 22.77 13.79 22.77 26.15 0 14.7-11.32 27.19-35.39 27.19-10.02 0-19.91-2.6-24.85-5.33L378.7 421.9z"></path>
                                        </g>
                                        <g>
                                            <path fill="#19bf70" d="M216.98,289.54l-12.78-25.55c-5.24-9.84-8.59-17.17-12.57-25.34h-0.42c-2.93,8.17-6.49,15.5-10.89,25.34l-11.73,25.55h-36.44L173,218.12l-39.37-69.74h36.65l12.36,25.76c4.19,8.59,7.33,15.5,10.68,23.46h0.42c3.35-9.01,6.07-15.29,9.63-23.46l11.94-25.76h36.44l-39.79,68.9l41.89,72.26H216.98z"></path>
                                        </g>
                                    </svg>
                                ) : item.fileType === '.zip' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
                                        <polygon fill="#282d35" points="375.58 252.7 510.52 311.62 375.58 311.62"></polygon>
                                        <path fill="#373e49" d="M126.04,22.26L21.57,126.73c-12.93,12.93-20.2,30.47-20.2,48.76v1.79c0-26.07,21.14-47.21,47.21-47.21h80.8v-80.8c0-26.07,21.14-47.21,47.21-47.21h-1.79C156.51,2.06,138.98,9.32,126.04,22.26z"></path>
                                        <path fill="#ebf2ff" d="M1.37,175.49v1.79c0-26.07,21.14-47.21,47.21-47.21h80.8v-80.8c0-26.07,21.14-47.21,47.21-47.21h196.98v508.82H1.37V175.49z"></path>
                                        <linearGradient id="SVGID_3_" x1="374.736" x2="100.937" y1="510.213" y2="35.979" gradientUnits="userSpaceOnUse">
                                            <stop offset=".001" stopColor="#ebf2ff"></stop>
                                            <stop offset="1" stopColor="#c8d6e8"></stop>
                                        </linearGradient>
                                        <path fill="url(#SVGID_3_)" d="M175.83,0.08c-26.17,0-47.39,21.22-47.39,47.39v81.12H47.32c-26.17,0-47.39,21.22-47.39,47.39l373.65,334.9V193.25L176.59,0.08H175.83z"></path>
                                        <rect width="373.46" height="157.94" x="137.54" y="311.79" fill="#373e49"></rect>
                                        <path fill="#fff" d="M238.37 429.56l41.77-60.11v-.52h-37.86v-16.39h63.62v11.45l-40.85 59.33v.52h41.5v16.39h-68.18V429.56zM338.94 352.53v87.7h-19.91v-87.7H338.94zM356.11 353.71c6.12-1.04 14.7-1.82 26.8-1.82 12.23 0 20.95 2.34 26.8 7.03 5.59 4.42 9.37 11.71 9.37 20.3s-2.86 15.87-8.07 20.82c-6.77 6.38-16.79 9.24-28.5 9.24-2.6 0-4.94-.13-6.77-.39v31.36h-19.65V353.71zM375.76 393.52c1.69.39 3.77.52 6.64.52 10.54 0 17.04-5.33 17.04-14.31 0-8.07-5.59-12.88-15.48-12.88-4.03 0-6.77.39-8.2.78V393.52z"></path>
                                        <rect width="17.95" height="152.55" x="299.05" y="2.04" fill="#aeb4c1"></rect>
                                        <rect width="53.84" height="17.95" x="281.1" y="34.94" fill="#aeb4c1"></rect>
                                        <rect width="53.84" height="17.95" x="281.1" y="70.83" fill="#aeb4c1"></rect>
                                        <rect width="53.84" height="17.95" x="281.1" y="106.72" fill="#aeb4c1"></rect>
                                        <rect width="53.84" height="53.84" x="281.1" y="142.61" fill="#9ba1aa"></rect>
                                        <path fill="#aeb4c1" d="M308.02,280.16c-10.58,0-20.54-4.44-27.33-12.18c-6.79-7.74-9.62-17.88-7.76-27.82l8.41-44.95h53.35l8.41,44.95c1.86,9.94-0.97,20.08-7.76,27.82C328.56,275.72,318.6,280.16,308.02,280.16L308.02,280.16z"></path>
                                        <path fill="#fff" d="M297.09,213.16l-5.64,30.16c-0.88,4.69,0.46,9.49,3.66,13.14c3.21,3.65,7.91,5.75,12.91,5.75s9.7-2.1,12.91-5.75c3.21-3.66,4.54-8.45,3.66-13.14l-5.64-30.16H297.09z"></path>
                                    </svg>
                                ) : (
                                    'Unknown'
                                )}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap">{item.size}</Table.Cell>
                            <Table.Cell className="whitespace-nowrap">{item.uploadedAt}</Table.Cell>
                            <Table.Cell className="whitespace-nowrap">{item.uploadedBy}</Table.Cell>
                            <Table.Cell className="px-4">
                                <div className="flex items-center justify-start gap-2">
                                    <button
                                        aria-label="Download"
                                        className="p-1 rounded hover:bg-transparent focus:outline-none"
                                        onClick={() => onDownloadReport(item)}
                                    >
                                        <Download01 className="size-5 text-tertiary" />
                                    </button>
                                    <button
                                        aria-label="Email"
                                        className="p-1 rounded hover:bg-transparent focus:outline-none"
                                        onClick={() => {
                                            setToastMessage('Demo - email sent');
                                            setToastType('info');
                                            setShowToast(true);
                                            setTimeout(() => setShowToast(false), 3000);
                                        }}
                                    >
                                        <Mail01 className="size-5 text-tertiary" />
                                    </button>
                                    <button
                                        aria-label="Delete"
                                        className="p-1 rounded hover:bg-transparent focus:outline-none"
                                        onClick={() => {
                                            if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                                onDeleteReport(item.name);
                                            }
                                        }}
                                    >
                                        <Trash01 className="size-5 text-tertiary" />
                                    </button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
                    </Table>
                    
                    {/* Pagination */}
                    <div className="flex justify-end px-6 py-4 border-t-0">
                        <PaginationButtonGroup 
                            align="right" 
                            page={currentPage} 
                            onPageChange={setCurrentPage}
                            total={totalPages || 1}
                        />
                    </div>
                </>
            )}
        </TableCard.Root>
    );
};

const ProgressIconCenteredSm = ({ onStepClick, confirmedSteps, items, selectedEmployees, removeEmployee, handleToggle, expandedStep, setExpandedStep, onConfirm, onCancel, onClear, searchTerm, setSearchTerm, searchResults, handleEmployeeSearch, handleEmployeeSelect, clearAllEmployees, isSearching }: { 
    onStepClick: (stepIndex: number) => void;
    confirmedSteps: Set<number>;
    items: typeof modalData;
    selectedEmployees: Employee[];
    removeEmployee: (id: string) => void;
    handleToggle: (modalType: string, itemId: string) => void;
    expandedStep: number | null;
    setExpandedStep: (step: number | null) => void;
    onConfirm: () => void;
    onCancel: () => void;
    onClear: () => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    searchResults: Employee[];
    handleEmployeeSearch: (value: string) => void;
    handleEmployeeSelect: (id: string) => void;
    clearAllEmployees: () => void;
    isSearching: boolean;
}) => {
    // Function to check if a category has any active toggles
    const hasActiveToggles = (stepIndex: number) => {
        // Employee Selection milestone (index 0) is complete if at least one employee is selected
        if (stepIndex === 0) {
            return selectedEmployees.length > 0;
        }
        
        // Adjust index for modal data (subtract 1 since Employee Selection doesn't have a modal)
        const modalKeys = ['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'];
        const modalKey = modalKeys[stepIndex - 1];
        const categoryItems = items[modalKey as keyof typeof items];
        return categoryItems.some(item => item.selected);
    };

    // Function to determine status based on confirmed steps and active toggles
    const getStepStatus = (index: number) => {
        // Employee Selection (index 0) is automatically complete when employees are selected
        if (index === 0) {
            return selectedEmployees.length > 0 ? "complete" : "current";
        }
        
        // Only show complete if the step has been confirmed AND has active toggles
        if (confirmedSteps.has(index) && hasActiveToggles(index)) {
            return "complete";
        }
        
        // Find the first incomplete step to mark as current
        const firstIncompleteIndex = [0, 1, 2, 3, 4, 5, 6, 7].find(i => {
            if (i === 0) return !hasActiveToggles(i); // Employee selection
            return !confirmedSteps.has(i);
        });
        return index === firstIncompleteIndex ? "current" : "incomplete";
    };

    const stepTemplates = [
        { title: "Employee Selection", description: "", icon: UsersPlus },
        { title: "Personal Info", description: "", icon: User01 },
        { title: "Employment Info", description: "", icon: UsersPlus },
        { title: "Passport Info", description: "", icon: Flag05 },
        { title: "Visa Info", description: "", icon: Stars02 },
        { title: "EID Info", description: "", icon: CheckCircle },
        { title: "MOL Info", description: "", icon: Flag05 },
        { title: "Insurance Info", description: "", icon: UsersPlus },
        { title: "Create Report", description: "", icon: File01 },
    ];

    const stepTemplatesLonger = [
        { title: "Employee Selection", description: "", icon: UsersPlus },
        { title: "Personal Info", description: "", icon: User01 },
        { title: "Employment Info", description: "", icon: UsersPlus },
        { title: "Passport Info", description: "", icon: Flag05 },
        { title: "Visa Info", description: "", icon: Stars02 },
        { title: "EID Info", description: "", icon: CheckCircle },
        { title: "MOL Info", description: "", icon: Flag05 },
        { title: "Insurance Info", description: "", icon: UsersPlus },
        { title: "Create Report", description: "", icon: File01 },
    ];

    const steps: ProgressFeaturedIconType[] = stepTemplates.map((step, index) => ({
        ...step,
        status: getStepStatus(index),
        connector: index !== stepTemplates.length - 1 ? true : false,
    }));

    const stepsWithLongerDescription: ProgressFeaturedIconType[] = stepTemplatesLonger.map((step, index) => ({
        ...step,
        status: getStepStatus(index),
        connector: index !== stepTemplatesLonger.length - 1 ? true : false,
    }));

        // Function to get selected items for each category
    const getSelectedItems = (stepIndex: number) => {
        if (stepIndex === 0) {
            // For Employee Selection, return count of selected employees
            const count = selectedEmployees.length;
            return count > 0 ? [`${count} employee${count > 1 ? 's' : ''} selected`] : [];
        }
        
        const modalKeys = ['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'];
        const modalKey = modalKeys[stepIndex - 1];
        const categoryItems = items[modalKey as keyof typeof items];
        const selectedCount = categoryItems.filter(item => item.selected).length;
        return selectedCount > 0 ? [`${selectedCount} field${selectedCount > 1 ? 's' : ''} selected`] : [];
    };

    return (
        <div>
            {/* Horizontal Progress Steps with Clickable Overlays */}
            <div className="max-md:hidden">
                <div className="relative">
                    <Progress.IconsWithText items={steps} size="sm" orientation="horizontal" />
                    <div className="absolute inset-0 grid grid-cols-9 gap-4">
                        {steps.map((step, index) => (
                            <button
                                key={index}
                                onClick={() => onStepClick(index)}
                                className="w-full h-full cursor-pointer hover:bg-transparent rounded-lg transition-colors duration-200 flex items-center justify-center group relative"
                                aria-label={`Click to edit ${step.title}`}
                            >
                                <span className="sr-only">Edit {step.title}</span>

                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Tags below each category */}
                <div className="grid grid-cols-9 gap-4 mt-4">
                    {steps.map((step, index) => {
                        const selectedItems = getSelectedItems(index);
                        if (selectedItems.length === 0) return <div key={index} />;
                        
                        return (
                            <div key={index}>
                                <TagGroup size="sm" label="">
                                    <TagList className="flex flex-wrap gap-1 justify-center">
                                        {selectedItems.map((item, itemIndex) => (
                                            <Tag 
                                                key={itemIndex}
                                                id={`${index}-${itemIndex}`}
                                                className="text-[10px] bg-white text-gray-600 rounded-full px-3 py-0.5 font-medium flex items-center whitespace-nowrap"
                                            >
                                                <span>{item}</span>

                                            </Tag>
                                        ))}
                                    </TagList>
                                </TagGroup>
                            </div>
                        );
                    })}
                </div>
                
                {/* Custom Overlay for Desktop */}
                {expandedStep !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Light overlay background */}
                        <div 
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setExpandedStep(null)}
                        />
                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-md mx-4">
                            {expandedStep === 0 ? (
                                <EmployeeSearchModal
                                    selectedEmployees={selectedEmployees}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    searchResults={searchResults}
                                    handleEmployeeSearch={handleEmployeeSearch}
                                    handleEmployeeSelect={handleEmployeeSelect}
                                    removeEmployee={removeEmployee}
                                    clearAllEmployees={clearAllEmployees}
                                    onClose={() => setExpandedStep(null)}
                                    isSearching={isSearching}
                                />
                            ) : (
                                <InlineExpandedSection
                                    stepIndex={expandedStep}
                                    items={items[(['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'][expandedStep - 1]) as keyof typeof items]}
                                    title={(['Personal Info', 'Employment Info', 'Passport Info', 'Visa Info', 'EID Info', 'MOL Info', 'Insurance Info', 'Create Report'][expandedStep - 1])}
                                    onToggle={(itemId) => {
                                        const modalKey = ['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'][expandedStep - 1];
                                        handleToggle(modalKey, itemId);
                                    }}
                                    onConfirm={onConfirm}
                                    onClear={onClear}
                                    onClose={() => setExpandedStep(null)}
                                    confirmButtonText={expandedStep === 8 ? "Submit" : "Next"}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Vertical Progress Steps with Clickable Overlays */}
            <div className="md:hidden">
                <div className="relative">
                    <Progress.IconsWithText items={stepsWithLongerDescription} size="sm" orientation="vertical" />
                    <div className="absolute inset-0 flex flex-col">
                        {stepsWithLongerDescription.map((step, index) => (
                            <button
                                key={index}
                                onClick={() => onStepClick(index)}
                                className="w-full flex-1 cursor-pointer hover:bg-transparent rounded-lg transition-colors duration-200 group relative"
                                aria-label={`Click to edit ${step.title}`}
                            >
                                <span className="sr-only">Edit {step.title}</span>

                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Tags for mobile view - shown inline with each step */}
                <div className="mt-4 space-y-3">
                    {stepsWithLongerDescription.map((step, index) => {
                        const selectedItems = getSelectedItems(index);
                        if (selectedItems.length === 0) return null;
                        
                        return (
                            <div key={index} className="pl-12 space-y-1">
                                <div className="text-xs text-gray-600 font-medium mb-1">{step.title}:</div>
                                <TagGroup size="sm" label="">
                                    <TagList className="flex flex-wrap gap-1 justify-center">
                                        {selectedItems.map((item, itemIndex) => (
                                            <Tag 
                                                key={itemIndex}
                                                id={`mobile-${index}-${itemIndex}`}
                                                className="text-[10px] bg-white text-gray-600 rounded-full px-2 py-0.5 font-medium flex items-center gap-1 whitespace-nowrap"
                                            >
                                                <span>{item}</span>

                                            </Tag>
                                        ))}
                                    </TagList>
                                </TagGroup>
                            </div>
                        );
                    })}
                </div>
                
                {/* Custom Overlay for Mobile */}
                {expandedStep !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Light overlay background */}
                        <div 
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setExpandedStep(null)}
                        />
                        {/* Modal content */}
                        <div className="relative z-10 w-full max-w-md mx-4">
                            {expandedStep === 0 ? (
                                <EmployeeSearchModal
                                    selectedEmployees={selectedEmployees}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    searchResults={searchResults}
                                    handleEmployeeSearch={handleEmployeeSearch}
                                    handleEmployeeSelect={handleEmployeeSelect}
                                    removeEmployee={removeEmployee}
                                    clearAllEmployees={clearAllEmployees}
                                    onClose={() => setExpandedStep(null)}
                                    isSearching={isSearching}
                                />
                            ) : (
                                <InlineExpandedSection
                                    stepIndex={expandedStep}
                                    items={items[(['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'][expandedStep - 1]) as keyof typeof items]}
                                    title={(['Personal Info', 'Employment Info', 'Passport Info', 'Visa Info', 'EID Info', 'MOL Info', 'Insurance Info', 'Create Report'][expandedStep - 1])}
                                    onToggle={(itemId) => {
                                        const modalKey = ['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'][expandedStep - 1];
                                        handleToggle(modalKey, itemId);
                                    }}
                                    onConfirm={onConfirm}
                                    onClear={onClear}
                                    onClose={() => setExpandedStep(null)}
                                    confirmButtonText={expandedStep === 8 ? "Submit" : "Next"}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function HomePage() {
    const [openModal, setOpenModal] = useState<string | null>(null);
    const [items, setItems] = useState(modalData);
    const [confirmedSteps, setConfirmedSteps] = useState<Set<number>>(new Set());
    const [previousConfirmedSteps, setPreviousConfirmedSteps] = useState<Set<number>>(new Set());
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    
    // Employee search states
    const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Employee[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
    
    // Report form states
    const [customerName, setCustomerName] = useState('');
    const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
    const [reportHistory, setReportHistory] = useState<ReportItem[]>([]);

    // Load reports from localStorage on component mount
    useEffect(() => {
        const storedReports = getStoredReports();
        setReportHistory(storedReports);
    }, []);

    // Save reports to localStorage whenever they change
    useEffect(() => {
        if (reportHistory.length > 0 || localStorage.getItem('reportHistory')) {
            localStorage.setItem('reportHistory', JSON.stringify(reportHistory));
        }
    }, [reportHistory]);

    const handleStepClick = (stepIndex: number) => {
        console.log('handleStepClick called with stepIndex:', stepIndex);
        // Toggle expanded state
        if (expandedStep === stepIndex) {
            setExpandedStep(null);
        } else {
            setExpandedStep(stepIndex);
            // Save current state before expanding
            setPreviousConfirmedSteps(new Set(confirmedSteps));
        }
    };

    const handleToggle = (modalType: string, itemId: string) => {
        setItems(prev => ({
            ...prev,
            [modalType]: prev[modalType as keyof typeof prev].map(item =>
                item.id === itemId && !(item as any).disabled ? { ...item, selected: !item.selected } : item
            )
        }));
    };

    const handleConfirm = async () => {
        // Mark the current expanded step as confirmed
        if (expandedStep !== null) {
            setConfirmedSteps(prev => new Set(prev).add(expandedStep));
            
            // If this is the final step (Create Report - index 8), show toast and reset the progress tracker
            if (expandedStep === 8) {
                // Validate that at least one employee is selected
                if (selectedEmployees.length === 0) {
                    setToastMessage('Please select at least one employee before submission');
                    setToastType('error');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                    return; // Don't proceed with submission
                }
                
                // Validate customer name and date
                if (!customerName.trim() || !selectedDate) {
                    // Show error toast
                    setToastMessage('Please add customer name and date before submission');
                    setToastType('error');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                    return; // Don't proceed with submission
                }
                
                // Determine file types based on selected toggles in Create Report
                const selectedFormats = items.createReport.filter(item => item.selected);
                
                // If no format is selected, default to .zip
                if (selectedFormats.length === 0) {
                    setToastMessage('Please select at least one export format');
                    setToastType('error');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                    return;
                }
                
                // Prepare report formats
                const reportFormats = {
                    pdf: selectedFormats.some(f => f.id === 'export-pdf'),
                    xlsx: selectedFormats.some(f => f.id === 'export-xlsx'),
                    zip: selectedFormats.some(f => f.id === 'export-zip')
                };
                
                // Prepare selected categories with active toggles
                const selectedCategories: Record<string, string[]> = {};
                
                // Personal Info
                if (items.personalInfo.some(item => item.selected)) {
                    selectedCategories.personalInfo = items.personalInfo
                        .filter(item => item.selected)
                        .map(item => item.id);
                }
                
                // Employment Info
                if (items.employmentInfo.some(item => item.selected)) {
                    selectedCategories.employmentInfo = items.employmentInfo
                        .filter(item => item.selected)
                        .map(item => item.id);
                }
                
                // Passport Info
                if (items.passportInfo.some(item => item.selected)) {
                    selectedCategories.passportInfo = items.passportInfo
                        .filter(item => item.selected)
                        .map(item => item.id);
                }
                
                // Visa Info
                if (items.visaInfo.some(item => item.selected)) {
                    selectedCategories.visaInfo = items.visaInfo
                        .filter(item => item.selected)
                        .map(item => item.id);
                }
                
                // EID Info
                if (items.eidInfo.some(item => item.selected)) {
                    selectedCategories.eidInfo = items.eidInfo
                        .filter(item => item.selected)
                        .map(item => item.id);
                }
                
                // MOL Info
                if (items.molInfo.some(item => item.selected)) {
                    selectedCategories.molInfo = items.molInfo
                        .filter(item => item.selected)
                        .map(item => item.id);
                }
                
                // Insurance Info
                if (items.insuranceInfo.some(item => item.selected)) {
                    selectedCategories.insuranceInfo = items.insuranceInfo
                        .filter(item => item.selected)
                        .map(item => item.id);
                }
                
                // Create new report entry
                const dateValue = selectedDate;
                const jsDate = dateValue.toDate(getLocalTimeZone());
                const day = String(jsDate.getDate()).padStart(2, '0');
                const month = String(jsDate.getMonth() + 1).padStart(2, '0');
                const year = jsDate.getFullYear();
                const dateStr = `${day}-${month}-${year}`;
                
                const customerNameCleaned = customerName.trim().replace(/\s+/g, '_');
                
                // Helper function to get unique filename
                const getUniqueFileName = (baseName: string, extension: string, existingNames: string[]): string => {
                    let fileName = `${baseName}${extension}`;
                    let counter = 1;
                    
                    // Check if filename already exists in report history or in the current batch
                    while (reportHistory.some(report => report.name === fileName) || existingNames.includes(fileName)) {
                        fileName = `${baseName}_(${counter})${extension}`;
                        counter++;
                    }
                    
                    return fileName;
                };
                
                // Create a report for each selected format
                const createdFileNames: string[] = [];
                const newReports = selectedFormats.map(format => {
                    let extension = '.zip';
                    if (format.id === 'export-pdf') extension = '.pdf';
                    else if (format.id === 'export-xlsx') extension = '.xlsx';
                    
                    const baseName = `${customerNameCleaned}_${dateStr}`;
                    const fileName = getUniqueFileName(baseName, extension, createdFileNames);
                    createdFileNames.push(fileName); // Add to the list of created files
                    
                    return {
                        name: fileName,
                        fileType: extension,
                        size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
                        uploadedAt: jsDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        updatedAt: jsDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        uploadedBy: "Current User",
                        // Store generation parameters for re-downloading
                        generationParams: {
                            customerName: customerName.trim(),
                            reportDate: dateStr,
                            selectedEmployees: [...selectedEmployees],
                            selectedCategories: JSON.parse(JSON.stringify(selectedCategories)),
                            reportFormat: format.id
                        }
                    };
                });
                
                // Call API to generate report
                try {
                    setToastMessage('Generating report...');
                    setToastType('info');
                    setShowToast(true);
                    
                    const response = await fetch('/api/generate-report', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customerName: customerNameCleaned,
                            reportDate: dateStr,
                            selectedEmployees,
                            selectedCategories,
                            reportFormats
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Import report generator dynamically to avoid SSR issues
                        const { generateReport } = await import('@/lib/report-generator');
                        
                        // Generate the report client-side
                        await generateReport(result.data, reportFormats);
                        
                        // Add new reports to the beginning of the list
                        setReportHistory([...newReports, ...reportHistory]);
                        
                        // Show success toast message
                        const formatCount = selectedFormats.length;
                        const formatNames = selectedFormats.map(f => {
                            if (f.id === 'export-pdf') return 'PDF';
                            if (f.id === 'export-xlsx') return 'Excel';
                            return 'ZIP';
                        }).join(', ');
                        setToastMessage(`${formatCount} file${formatCount > 1 ? 's' : ''} downloaded (${formatNames})`);
                        setToastType('success');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                        
                        setTimeout(() => {
                            setConfirmedSteps(new Set());
                            // Reset all form data
                            setItems(modalData);
                            setSelectedEmployees([]);
                            setCustomerName('');
                            setSelectedDate(null);
                        }, 500);
                    } else {
                        setToastMessage('Error generating report: ' + result.error);
                        setToastType('error');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 5000);
                    }
                } catch (error) {
                    console.error('Error calling report API:', error);
                    setToastMessage('Failed to generate report. Please try again.');
                    setToastType('error');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 5000);
                }
            }
        }
        setExpandedStep(null);
    };

    const handleClear = () => {
        // Clear all toggles for the current modal without closing it
        if (expandedStep !== null && expandedStep !== 0) {
            const modalKeys = ['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'];
            const modalKey = modalKeys[expandedStep - 1];
            
            setItems(prev => ({
                ...prev,
                [modalKey]: prev[modalKey as keyof typeof prev].map(item => ({
                    ...item,
                    selected: false
                }))
            }));
        }
    };

    const handleCancel = () => {
        // Clear all toggles for the current modal
        if (expandedStep !== null && expandedStep !== 0) {
            const modalKeys = ['personalInfo', 'employmentInfo', 'passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'insuranceInfo', 'createReport'];
            const modalKey = modalKeys[expandedStep - 1];
            
            setItems(prev => ({
                ...prev,
                [modalKey]: prev[modalKey as keyof typeof prev].map(item => ({
                    ...item,
                    selected: false
                }))
            }));
        }
        
        // Revert confirmed steps
        setConfirmedSteps(previousConfirmedSteps);
        setExpandedStep(null);
    };

    const modalTitles = {
        personalInfo: 'Personal Info',
        employmentInfo: 'Employment Info',
        passportInfo: 'Passport Info',
        visaInfo: 'Visa Info',
        eidInfo: 'EID Info',
        molInfo: 'MOL Info',
        insuranceInfo: 'Insurance Info'
    };

    // Employee search functions
    const handleEmployeeSearch = async (value: string) => {
        setSearchTerm(value);
        if (value.length >= 2) {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/employees?search=${encodeURIComponent(value)}`);
                const data = await response.json();
                
                if (data.success) {
                    setSearchResults(data.data);
                } else {
                    console.error('Error searching employees:', data.error);
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleEmployeeSelect = (key: string | number | null) => {
        if (key) {
            const employee = searchResults.find(emp => emp.employee_code === key);
            if (employee && !selectedEmployees.find(e => e.employee_code === employee.employee_code)) {
                setSelectedEmployees([...selectedEmployees, employee]);
                setSearchTerm('');
                setSearchResults([]);
            }
        }
    };

    const removeEmployee = (employeeCode: string) => {
        setSelectedEmployees(selectedEmployees.filter(emp => emp.employee_code !== employeeCode));
    };
    
    const clearAllEmployees = () => {
        setSelectedEmployees([]);
    };

    const deleteReport = (reportName: string) => {
        setReportHistory(reportHistory.filter(report => report.name !== reportName));
    };

    const downloadReport = async (reportItem: ReportItem) => {
        if (!reportItem.generationParams) {
            setToastMessage('Cannot download: Report generation data not available');
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        try {
            setToastMessage('Regenerating and downloading report...');
            setToastType('info');
            setShowToast(true);

            const { generationParams } = reportItem;
            
            // Call the API to get fresh data
            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName: generationParams.customerName,
                    reportDate: generationParams.reportDate,
                    selectedEmployees: generationParams.selectedEmployees,
                    selectedCategories: generationParams.selectedCategories,
                    reportFormats: [generationParams.reportFormat]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate report data');
            }

            const result = await response.json();
            
            if (result.success) {
                // Import report generator dynamically
                const { generateReport } = await import('@/lib/report-generator');
                
                // Determine the format
                const reportFormats = {
                    pdf: generationParams.reportFormat === 'export-pdf',
                    xlsx: generationParams.reportFormat === 'export-xlsx',
                    zip: generationParams.reportFormat === 'export-zip'
                };
                
                // Generate and download the report
                await generateReport(result.data, reportFormats);
                
                setToastMessage('Report downloaded successfully');
                setToastType('success');
            } else {
                throw new Error(result.error || 'Failed to generate report');
            }
        } catch (error) {
            console.error('Download error:', error);
            setToastMessage('Failed to download report. Please try again.');
            setToastType('error');
        } finally {
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    return (
        <div>
            <AppHeader 
                showToast={showToast}
                toastMessage={toastMessage}
                toastType={toastType}
            />
            <div className="px-16 pb-8 pt-12">
                {/* Progress Tracker in card */}
                <TableCard.Root>
                    <TableCard.Header 
                        className="py-[0.6875rem] md:items-center"
                        description="Select items to create custom report"
                        contentTrailing={
                            <div className="flex items-center gap-3">
                                <div className="w-64">
                                    <Input 
                                        size="sm" 
                                        placeholder="Enter customer name ..." 
                                        inputClassName="!text-sm font-normal h-[36px]" 
                                        value={customerName}
                                        onChange={(value: string) => setCustomerName(value)}
                                    />
                                </div>
                                <DatePicker 
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                />
                                <button
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group relative"
                                    onClick={() => {
                                        // Reset all selections
                                        setConfirmedSteps(new Set());
                                        setItems(modalData);
                                        setSelectedEmployees([]);
                                        setCustomerName('');
                                        setSelectedDate(null);
                                        setExpandedStep(null);
                                        
                                        // Show success toast
                                        setToastMessage('All selections cleared');
                                        setToastType('info');
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                    }}
                                    aria-label="Reset all selections"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                                        <path
                                            d="M2 10C2 10 4.00498 7.26822 5.63384 5.63824C7.26269 4.00827 9.5136 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.89691 21 4.43511 18.2543 3.35177 14.5M2 10V4M2 10H8"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>

                                </button>
                            </div>
                        }
                        title={
                            <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
                                    <path fill="#56B3E5" d="M44.7 8H22.6c-.9 0-1.8-.4-2.4-1l-2.8-3c-.6-.7-1.5-1-2.4-1H3.3C1.5 3 0 4.5 0 6.3v31.4C0 39.5 1.5 41 3.3 41h41.4c1.8 0 3.3-1.5 3.3-3.3V11.3C48 9.5 46.5 8 44.7 8z"></path>
                                    <path fill="#FFF" d="M42.9 11.3H5.1c-1.4 0-2.5 1.1-2.5 2.5v25.1c0 1.4 1.1 2.5 2.5 2.5H43c1.4 0 2.5-1.1 2.5-2.5V13.8c-.1-1.4-1.2-2.5-2.6-2.5z"></path>
                                    <path fill="#98D0F1" d="M44.7 15.3H3.3c-1.8 0-3.3 1.5-3.3 3.3v23.1C0 43.5 1.5 45 3.3 45h41.4c1.8 0 3.3-1.5 3.3-3.3V18.6c0-1.8-1.5-3.3-3.3-3.3z"></path>
                                </svg>
                                Create Report
                            </span>
                        }
                    />
                    <div className="px-6 pt-8 pb-4">
                        <ProgressIconCenteredSm 
                            onStepClick={handleStepClick} 
                            confirmedSteps={confirmedSteps} 
                            items={items} 
                            selectedEmployees={selectedEmployees}
                            removeEmployee={removeEmployee}
                            handleToggle={handleToggle}
                            expandedStep={expandedStep}
                            setExpandedStep={setExpandedStep}
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                            onClear={handleClear}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            searchResults={searchResults}
                            handleEmployeeSearch={handleEmployeeSearch}
                            handleEmployeeSelect={handleEmployeeSelect}
                            clearAllEmployees={clearAllEmployees}
                            isSearching={isSearching}
                        />
                    </div>
                </TableCard.Root>

            {/* Reports History Table */}
            <div className="mt-12">
                <ReportsHistoryTable 
                    reportHistory={reportHistory} 
                    onDeleteReport={deleteReport}
                    onDownloadReport={downloadReport}
                    setToastMessage={setToastMessage}
                    setToastType={setToastType}
                    setShowToast={setShowToast}
                />
            </div>

            </div>
        </div>
    );
}

