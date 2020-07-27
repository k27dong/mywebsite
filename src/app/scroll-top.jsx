import React, { useEffect, Fragment } from "react"
import { withRouter } from "react-router-dom"

function ScrollTop(props) {
  useEffect(() => {
    const unlisten = props.history.listen(() => {
      window.scrollTo(0, 0)
    })
    return () => {
      unlisten()
    }
  }, [])

  return <Fragment>{props.children}</Fragment>
}

export default withRouter(ScrollTop)
