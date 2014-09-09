//main.js contents
//Pass a config object to require
require.config({
    "packages": ["cart", "store"]
});

require(["cart", "store", "store/util"],
function (cart,   store,   util) {
    //use the modules as usual.
});
