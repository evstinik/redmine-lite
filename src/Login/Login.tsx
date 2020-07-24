import * as React from 'react'
import { useRedmineService } from '../hooks/redmineService'
import { useAppState } from '../hooks/appState'
import { useOnChange } from '../hooks/utils'

export function Login() {
  const [apiKey, setApiKey] = React.useState('')
  const redmineService = useRedmineService()
  const [appState, setAppState] = useAppState()

  const handleInputChange =  useOnChange(setApiKey)

  const login = React.useCallback(async (event) => {
    event.preventDefault()
    try {
      const user = await redmineService.login(apiKey)
      setAppState({
        ...appState,
        user,
        apiKey
      })
    } catch (err) {
      console.error(err)
      alert('Seems like API key is not working')
    }
  }, [redmineService, apiKey, setAppState, appState])

  return (
    <div>
      <h1>Please login</h1>
      <form onSubmit={login}>
        <label>API Key</label>
        <input value={apiKey} onChange={handleInputChange} required />
        <input type='submit' value='Login'></input>
      </form>
      <div>
        You can find your API key on your account page ( /my/account ) when
        logged in, on the right-hand pane of the default layout.
      </div>
    </div>
  );
}