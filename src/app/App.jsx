import React from "react"
import { Route, BrowserRouter, Redirect, Switch } from "react-router-dom"
import Main from "./main"
import BlogMain from "./blog/main"
import history from "./history"
import NotFound from "./404"
import Post from "./blog/post"
import ScrollTop from "./scroll-top"

const App = () => {
  return (
    <BrowserRouter history={history}>
      <ScrollTop>
        <Switch>
          <Route path="/" exact>
            <Main />
          </Route>
          <Route path="/blog" exact>
            <BlogMain />
          </Route>
          <Route path="/post/:id" exact>
            <Post />
          </Route>
          <Route path="/404">
            <NotFound />
          </Route>
          <Redirect to="/404" />
        </Switch>
      </ScrollTop>
    </BrowserRouter>
  )
}

export default App
