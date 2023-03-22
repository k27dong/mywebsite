import{ useEffect, Fragment } from "react"
import { withRouter } from "react-router-dom"

const ScrollTop = ({ history, children }) => {
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0)
    })
    return () => {
      unlisten()
    }
  }, [history])

  return <Fragment>{children}</Fragment>
}

export default withRouter(ScrollTop)
