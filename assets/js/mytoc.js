var node = document.createElement("H3"); 
node.setAttribute("id", "h2node");                // Create a <h2> node
var textnode = document.createTextNode("Contents");      // Create a text node
node.appendChild(textnode);                              // Append the text to <h2>
document.getElementById("markdown-toc").prepend(node);	 // Prepend to toc
document.getElementById("markdown-toc").style.paddingTop = "10px";
