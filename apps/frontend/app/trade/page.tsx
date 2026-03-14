import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const TradePage = () => {
  return (
    <div className=' flex flex-1 items-center justify-center h-screen w-screen'>
      <Link href={'/'}>
      <Button variant={'outline'}>Return Home</Button>
      </Link>
    </div>
  )
}

export default TradePage