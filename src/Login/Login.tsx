import * as React from 'react'
import { useRedmineService } from '../hooks/redmineService'
import { useAppState } from '../hooks/appState'
import { useOnChange } from '../hooks/utils'
import './Login.css'

export function Login() {
  const [apiKey, setApiKey] = React.useState('')
  const redmineService = useRedmineService()
  const [, setAppState] = useAppState()

  const handleInputChange =  useOnChange(setApiKey)

  const login = React.useCallback(async (event) => {
    event.preventDefault()
    try {
      const user = await redmineService.login(apiKey)
      setAppState(appState => ({
        ...appState,
        user,
        apiKey
      }))
    } catch (err) {
      console.error(err)
      alert('Seems like API key is not working')
    }
  }, [redmineService, apiKey, setAppState])

  return (
    <div className="login page">
      <h1>Please login</h1>
      <form onSubmit={login}>
        <label>API Key</label>
        <input value={apiKey} onChange={handleInputChange} required />
        <input type='submit' value='Login' className='contained'></input>
      </form>
      <div className="tip">
        You can find your API key on your account page ( /my/account ) when
        logged in, on the right-hand pane of the default layout.
      </div>
    </div>
  );
}