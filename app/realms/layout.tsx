
interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function SignUpLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex h-[calc(100vh)] overflow-hidden">
      <div className="group w-full overflow-hidden pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {children}
      </div>
    </div>
  )
}
