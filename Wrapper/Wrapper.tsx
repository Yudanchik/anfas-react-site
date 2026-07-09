import { ReactNode } from 'react'

import stls from './Wrapper.module.sass'

type Props = {
  children: ReactNode
}

const Wrapper = ({ children }: Props) => {
  return <div className={stls.container}>{children}</div>
}

export default Wrapper
