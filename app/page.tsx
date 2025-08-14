import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

export default async function Home() {
  const user = await currentUser()
  
  if (user) {
    redirect("/pipeline")
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Hiring Management System
        </h1>
        <p className="text-gray-600">
          Please sign in to access the system.
        </p>
      </div>
    </div>
  )
}