import React from "react";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
    label: string;
    active?: boolean;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs: Breadcrumb[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider font-semibold">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <span className={crumb.active ? "text-blue-600 dark:text-blue-400" : ""}>{crumb.label}</span>
                            {index < breadcrumbs.length - 1 && <ChevronRight size={14} />}
                        </React.Fragment>
                    ))}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mt-6">{title}</h1>
            </div>
        </div>
    );
};

export default PageHeader;
