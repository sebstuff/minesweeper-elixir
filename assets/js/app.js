// We import the CSS which is extracted to its own file by esbuild.
// Remove this line if you add a your own CSS build pipeline (e.g postcss).
import "../css/app.css"

// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "./vendor/some-package.js"
//
// Alternatively, you can `npm install some-package` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"

let Hooks = {}
Hooks.ToggleFlag = {
    mounted() {
        let hook = this
        hook.eventListener = function(e) {
            e.preventDefault()
            let row = hook.el.getAttribute("phx-value-row")
            let col = hook.el.getAttribute("phx-value-col")
            hook.pushEvent("toggle_flag", {"row": row, "col": col})
        }

        // destroyed is called after the element is removed from the DOM, so we need to store
        // a reference to the parent node on the hook.
        hook.parentNode = hook.el.parentNode
        hook.el.parentNode.addEventListener("contextmenu", hook.eventListener)
    },

    destroyed() {
        this.parentNode.removeEventListener("contextmenu", this.eventListener)
    }
}

Hooks.NewGame = {
    mounted() {
        let hook = this

        document.body.querySelector("input[name='difficulty']").checked = true
        hook.el.addEventListener("click", function(e) {
            e.preventDefault()

            let selectedDifficulty = document.body.querySelector("input[name='difficulty']:checked")
            hook.pushEvent("new_game", {"difficulty": selectedDifficulty.value})
        })
    }
}

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {hooks: Hooks, params: {_csrf_token: csrfToken}})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
