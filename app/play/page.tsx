import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { Header } from '@/components/header'
import { HeaderWhite } from '@/components/header-white'

export default function IndexPage() {
  const id = nanoid()

  return <><HeaderWhite/><Chat id={id} /></>
}
