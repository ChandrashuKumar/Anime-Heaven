import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner"

export default function SignInLayout({ children }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}
