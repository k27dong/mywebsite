import { Route, BrowserRouter, Redirect, Switch } from "react-router-dom"
import { ConfigProvider } from "antd"
import Main from "./main"
import BlogMain from "./blog/main"
import history from "./history"
import NotFound from "./404"
import Post from "./blog/post"
import SaltMain from "./salt/main"
import SaltContent from "./salt/content"
import Rss from "./files/rss"
import Resume from "./files/resume"
import AboutMain from "./about/about-main"
import ScrollTop from "./scroll-top"
import ProjectMain from "./project/project-main"

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 2,
        },
        components: {
          Card: {
            motionDurationMid: "0.15s",
          },
        },
      }}
    >
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
            <Route path="/salt" exact>
              <SaltMain />
            </Route>
            <Route path="/salt/:key" exact>
              <SaltContent />
            </Route>
            <Route path="/feed" exact>
              <Rss />
            </Route>
            <Route path="/resume" exact>
              <Resume />
            </Route>
            <Route path="/about" exact>
              <AboutMain />
            </Route>
            <Route path="/project" exact>
              <ProjectMain />
            </Route>
            <Route path="/404">
              <NotFound />
            </Route>
            <Redirect to="/404" />
          </Switch>
        </ScrollTop>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
