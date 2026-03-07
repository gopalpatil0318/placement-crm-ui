import { type FC, Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
    label: string;
    path?: string;
    active?: boolean;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
}

const PageHeader: FC<PageHeaderProps> = ({ title, breadcrumbs }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">
                {breadcrumbs.map((crumb, index) => (
                    <Fragment key={crumb.label}>
                        {crumb.path && !crumb.active ? (
                            <Link
                                to={crumb.path}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className={crumb.active ? "text-blue-600" : ""}>
                                {crumb.label}
                            </span>
                        )}
                        {index < breadcrumbs.length - 1 && (
                            <ChevronRight size={14} aria-hidden="true" />
                        )}
                    </Fragment>
                ))}
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-6">
                {title}
            </h1>
        </div>
    </div>
);

export default PageHeader;
