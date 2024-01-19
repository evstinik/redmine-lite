import { BrowserRouter } from 'react-router-dom'

export const Router: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}
