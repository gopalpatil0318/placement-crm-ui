import { useContext } from "react"
import { StudentAuthContext } from "@/context/students/StudentAuthContext"

export const useStudentAuth = () => {
    const context = useContext(StudentAuthContext)

    if (!context) {
        throw new Error(
            "useStudentAuth must be used within StudentAuthProvider"
        )
    }

    return context
}