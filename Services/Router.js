const Router = {
    init: () => {
        document.querySelectorAll('a.navLink').forEach( a => {
            a.addEventListener("click", e => {
                e.preventDefault()
                const href = e.target.getAttribute('href')
                Router.go(href)
            })
        })
         // It listen for history changes
        window.addEventListener('popstate',  event => {
            Router.go(event.state.route, false);
        });
        // Process initial URL   
        Router.go(location.pathname);
    },    
    go: (route, addToHistory=true) => {
        if (addToHistory) {
            history.pushState({ route }, '', route);
        }
        let pageElement = null
        switch ( route ) {
            case "/":
                pageElement = document.createElement("h1")
                pageElement.innerText = "Index"
                break
            case "/home":
                pageElement = document.createElement("h1")
                pageElement.innerText = "Home"
                break
            case "/about":
                pageElement = document.createElement("h1")
                pageElement.innerText = "Halaman About"
                break
            default:
                pageElement = document.createElement("h1")
                pageElement.innerText = "404"
                break; 
        }
        if (pageElement) {
            document.querySelector(".root").innerHTML = "";
            document.querySelector(".root").appendChild(pageElement);
        }
        window.scrollX = 0;
    }
}

export default Router;