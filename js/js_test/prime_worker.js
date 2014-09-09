 function isPrime(n) { 
    if (n == 0 || n == 1) { 
        return false; 
    } 
    var bound = Math.floor(Math.sqrt(n)); 
    for (var i = 2; i <= bound; i++) { 
       if (n % i == 0) { 
           return false; 
       } 
    } 
    return true; 
 }
 
  function calculateNormal(MAX) { 
    var count = 0; 
    for (var i = 2; i <= MAX; i++) { 
        if (isPrime(i)) { 
            count++; 
        } 
    } 
    return  count; 
 }
 
onmessage = function(event) { 
    var limit = event.data; 
    var count = calculateNormal(limit); 
    postMessage(count); 
 }
 /*
  onconnect = function(event) { 
    var port = event.ports[0]; 
    port.onmessage = function(event) { 
        var limit = event.data; 
        var count = calculateNormal(limit); 
        port.postMessage(count); 
    }; 
 }*/