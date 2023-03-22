---
title: Build a Web App - Part 1/2
abbrlink: 73316
date: 2021-10-11 02:06:57
---

This article series covers the development the deployment of a web application.

I've spent a long time building this website and after it's successfully deployed I've decided to summarize the steps I took. I'll try to make things simple and explain the purpose of each of my step.

Let's first list all the technologies used:

```
### Development ###
# Backend
Flask (Gunicorn)
# Frontend
React

### Deployment ###
# Option 1 (recommended, ~$10/month)
Heroku Dyno
# Option 2 (~$50/month)
Docker
Nginx
Google Cloud Platform
Kubernetes

### Domain ###
Google Domain (~$30/year)
```

As you can see, to get your web-app live, there are two main objectives: get your app running locally (on localhost), and deploy it to a server (so that any device connected to Wi-Fi could access it). For the deployment part I would only cover the steps to use Heroku, since GCP is much more complicated and costs more, even though it provides better service and richer environment.

We'll focus on the first part for now, let's get started.

### Prerequisite

The following tools would be needed during the process, you don't need to have them all installed now but they will be required later.

Also we assume the development would be completed on a unix-based OS with git installed, Windows users could also follow this article but might require some modification to make all commands work.

```
prerequisite
├── nodejs
│   ├── npm
│   └── npx
├── python3
│   ├── pip3
│   └── virtualenv
├── heroku
│   └── heroku cli
├── nginx
└── k8s stuff
    ├── google account
    ├── gcloud cli tool
    └── kubectl
```

### Frontend

The frontend provides the appearance of the application. We could easily get it working by using react and the `create-react-app` script provided by the offical repo. If you're experienced with this part feel free to skip to later chapters, else it can be done by enter the following commands (we use `myapp` as the folder name & app name):

```bash
mkdir myapp
npx create-react-app myapp --use-npm
cd myapp
npm install react-bootstrap@next bootstrap@5.1.1 #for later use
npm start

Compiled successfully!

You can now view myapp in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://<some ip>:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

Now if we go to [`http://localhost:3000/`](http://localhost:3000/) you can see a big rotating blue icon, this means the react frontend is up and running on our local machine. Let's do some simple modification so that it displays something useful (you can modify in any way but here we're just gonna build the simplest app ever):

```jsx
/* App.js */

import "./App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { Button, Form } from "react-bootstrap"

const App = () => {
  const get_command = () => {
    document.getElementById("textbox").value = "pong!"
  }

  return (
    <>
      <Form>
        <Form.Group style={{ width: "40%" }}>
          <Form.Label>From Flask:</Form.Label>
          <Form.Control id="textbox" />
        </Form.Group>
        <Button
          variant="primary"
          style={{ marginTop: "15px" }}
          onClick={() => {
            get_command()
          }}
        >
          Ping
        </Button>
      </Form>
    </>
  )
}

export default App
```

Now your front end should look like this:

<img src="/images/73316/1.png" width="70%"/>

We expect that once the button is clicked, the value of the textbox should change, now the text is changed to a hard-coded value 'pong!', but after the backend is set it would be changed to something we defined in flask.

Our frontend is finished for now, let's move on to the backend.

### Backend

In your project folder (/myapp in this case), do the following:

```bash
python3 -m venv venv
source venv/bin/activate
pip install flask flask_cors gunicorn
pip freeze > requirement.txt
```

These bash commands create a 'virtual enviornment' using `virtualenv`, similar to the `node_module` folder which is the dependencies used by react, this creates a folder called 'venv' where all our required python packages are installed.

`source venv/bin/activate` would enter this virtual enviornment, and `deactivate` would exit from it. The last command notes everything we've added to a text file named `requirement.txt` so that anyone could just do `pip install -r requirement.txt` to install all pip dependencies.

Now let's create a file named `app.py`, this is where our backend server is served.

```python
# app.py

from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='build', static_url_path='', template_folder='build')
CORS(app)

@app.route("/")
def serve():
  return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
  return send_from_directory(app.static_folder, 'index.html')

@app.route("/ready")
def ready():
  return "ready", 200

if __name__ == "__main__":
    app.run(host='0.0.0.0')
```

In this python file we have created an app named 'app', serve it using a static folder which we will build later with `npm`. Except for the root index it now only provides one api call named 'ready', we can test it by executing:

```python
python3 app.py
```

and go to [`http://localhost:5000/ready`](http://localhost:5000/ready). You should be able to see the text 'ready' on the main page now. We will use flask to handle any api calls from the frontend. Using this blog as an example, once you click on the `/blog` link, react would request a list articles and flask would respond to the api call with a jsonified list of all articles along with their information.

<img src="/images/73316/2.png" width="70%"/>

You may also notice that the root link [`http://localhost:5000/`](http://localhost:5000/ready) would be inaccessible. This is because we haven't setup our static folder, let's do it now and combine react and flask together:

```bash
npm run build
python3 app.py
```

By this point, our file structure should looks like this:

```
myapp
├── app.py
├── README.md
├── build/
├── venv/
├── node_modules/
├── package-lock.json
├── package.json
├── requirements.txt
├── public
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
└── src
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── reportWebVitals.js
    └── setupTests.js
```

Now if we hit [`http://localhost:5000/`](http://localhost:5000/) again, the page we coded in react should shown:

<img src="/images/73316/3.png" width="70%"/>

This is because flask is now using the static files generated by `npm` as the front end. Thus for any changes made in react to be displayed, we need to run `npm run build` again and update the `build` folder. This is definitely slow and frustrating since the building process usually take minutes. It would be much easier if we do all the frontend editing using `npm start` , as any changes would be updated instantaneously, and only generate the `build` folder once it's ready to serve.

### Frontend + Backend (HTTP Requests)

By this point, we have built a frontend with react and a backend with flask, and partially connected them together using the static folder. There is one crucial step, however, still remains missing in this process. We would still need to make the connection from frontend to backend as api calls. There are many tools available for this feature, such as fetch, GraphQL, jQuery, etc., each has their own pros and cons. The one we will be using is axios. It is a modern third-party library which stands out among many of the classic built-in methods. [This article](https://www.geeksforgeeks.org/difference-between-fetch-and-axios-js-for-making-http-requests/) discussed this topic in detail. Nonetheless, most of the additional features provided would be an overkill for a small app like this (unless you're still browsing using Internet Explorer), so feel free to use any technology you wish.

We start by installing the node package using `npm`:

```bash
npm install axios
```

 Once this process is completed, we could go ahead and make our first api call.

```jsx
/* Api.js */
/* update get_command */

import axios from "axios"

const get_command = () => {
    const HOST = "localhost:5000"

    axios
      .get(HOST + "/api/ping")
      .then((res) => {
        document.getElementById("textbox").value = res.data
      })
}
```

```python
# app.py
# add new ping route

@app.route("/api/ping", methods=['GET', 'POST'])
def ping():
  return "pong from flask!", 200
```

After building and starting the server again, we can reload the page and click on the button again, you will notice the text in the input field has changed to:

<img src="/images/73316/4.png" width="70%"/>

In this example we have returned a plain string, however flask also provided a built-in function called `jsonify` which parses JavaScript object to json, it is widely used when the returned data contains richer content.

In the `Api.js` you'll see that the call is made through a variable named `HOST` , this link is specifically separated out because we will be changing its value when the project is deployed to the Heroku server. Now the frontend is fetching from [`http://localhost:5000/`](localhost:5000ready)  which is the port flask runs on, in the later chapters we will change it to our live website domain.

By this point the development structure is completed, the react side will handle frontend pages, the flask side will handle api calls. Now we can move on the deploy the app to an actual website.

End of Part 1 ([go to Part 2](https://kefan.me/post/28379))