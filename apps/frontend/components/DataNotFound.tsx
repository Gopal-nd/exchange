"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DataNotFound({token}:{token:string}) {
  const router = useRouter()
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      router.push("/")
      return
    }

    const timer = setTimeout(() => {
      setCount(c => c - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, router])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">

      {/* BLUE TRANSPARENT BLUR OVERLAY */}
        <div className="absolute inset-0 bg-base-background-l1 backdrop-blur-lg" />

      {/* CENTER CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight">
          Data Not Found for {token} Token
        </h1>

        <p className="mt-4 text-lg opacity-90">
          Returning to home in{" "}
          <span className="font-semibold tabular-nums">
            {count}
          </span>
          …
        </p>
      </div>

    </div>
  )
}
