import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { fadeInUp, smoothTransition } from "@/lib/animations"

interface Breadcrumb {
  label: string
  path?: string
  active?: boolean
}

interface PageHeaderProps {
  title: string
  breadcrumbs: Breadcrumb[]
}

export default function PageHeader({ title, breadcrumbs }: PageHeaderProps) {
  const shouldReduce = useReducedMotion()
  const Wrapper = shouldReduce ? "h1" : motion.h1

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider font-semibold"
        >
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.label}>
              {crumb.path && !crumb.active ? (
                <Link
                  to={crumb.path}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={crumb.active ? "text-blue-600 dark:text-blue-400" : ""}>
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight size={14} aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </nav>
        <Wrapper
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mt-6"
          {...(shouldReduce ? {} : { variants: fadeInUp, initial: "hidden", animate: "visible", transition: smoothTransition })}
        >
          {title}
        </Wrapper>
      </div>
    </div>
  )
}
