const promptContainer = document.getElementById("prompt-container");
var log = [];
var useIframe = true;

const promptButton = document.getElementById("prompt-button");
promptButton.addEventListener("click", ()=>(handlePromptButtonClick()));

const baseCode = `
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
`

function createIframe(script) {
    var canvasContainer = document.getElementById("canvas-container");
    canvasContainer.innerHTML = "";
    var iframe = document.createElement('iframe');
    var html = `<body><canvas id="canvas" width="800" height="800"></canvas><script>${baseCode + script}</script></body>`;
    canvasContainer.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();

    iframe.width  = iframe.contentWindow.document.body.scrollWidth;
    iframe.height = iframe.contentWindow.document.body.scrollHeight;
}

function addPrompt(txt, addSpinner=true) {
    let newPrompt = document.createElement("div");
    newPrompt.className = "prompt";
    newPrompt.textContent = txt;

    if (addSpinner) {
        let spinner = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>';
        let spinnerDiv = document.createElement("div");
        spinnerDiv.innerHTML = spinner;
        newPrompt.appendChild(spinnerDiv);
    }
    
    promptContainer.appendChild(newPrompt);
}

function handlePromptButtonClick() {
    let promptInput = document.getElementById("prompt-input");
    let txt = promptInput.value;
    if (txt == "") return;
    addPrompt(txt);
    promptInput.value = "";
    let data = {};
    data.log = log;
    data.msg = txt;
    fetch("data.json", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data)
        if (data.status == "ERROR") {
            promptContainer.lastChild.lastChild.innerHTML = "ERROR"
            return;
        }
        promptContainer.lastChild.lastChild.innerHTML = ""

        if (data.response.indexOf("```") > -1) {
            let msg = "#" + data.response + "#";
            let parts = msg.split("```");
            var code = parts[1]
            if (code.startsWith("javascript")) {
                code = code.replace("javascript","")
            } else if (code.startsWith("js")) {
                code = code.replace("js","")
            }
        } else {
            var code = data.response;
        }
        
        if (useIframe) {
            createIframe(code)
        } else {
            eval(code)
        }
        log.push({role: "user", content: txt})
        log.push({role: "assistant", content: data.response})
    });
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.textAlign = "center";
ctx.fillStyle = "white";
ctx.fillRect(0,0,800,800);
ctx.fillStyle = "black";
ctx.font = "48px serif";
ctx.fillText("Fill the canvas using prompts", 400, 400);