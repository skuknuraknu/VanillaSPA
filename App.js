import Store from './Services/Store.js';
import API from './Services/Api.js';
import Router from './Services/Router.js'

window.app = {}
app.store = Store;
app.router = Router

// check if document is ready or not yo
if (document.readyState !== 'loading') {
    const data = await API.fetchUrl()
    app.store.users = data
    app.router.init()
} else {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('document was not ready, place code here');
    });
}
