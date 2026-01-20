import { LoaderCircle } from "lucide-react"
import React from "react"
interface LoadingProps {
  classNames?: string;
}
function Loading({classNames}:LoadingProps) {
  return (
    <div className="flex items-center justify-center">
      <LoaderCircle className={`w-5 h-5 animate-spin text-gray-600 ${classNames}`} />
    </div>
  )
}

export default Loading