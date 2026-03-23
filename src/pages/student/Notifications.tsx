import AnimatedPage from "@/components/ui/AnimatedPage"
import NotificationCenter from "@/components/student/notifications/NotificationCenter"

export default function Notifications() {
  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8">
        <NotificationCenter />
      </div>
    </AnimatedPage>
  )
}
