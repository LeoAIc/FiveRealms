import { Header } from '@/components/header'
import ProfileLookUp from '@/components/profile-lookup'
export default function IndexPage({ params }: { params: { username: string } }) {

  return (
    <>
      <Header/>
      <ProfileLookUp username={params.username}></ProfileLookUp>
      </>
  )
}

