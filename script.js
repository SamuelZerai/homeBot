const button = document.getElementById("summarize-btn");
const textarea = document.getElementById("text-input");
const resultat = document.getElementById("resultat");
const fileInfo = document.getElementById("file-info");
let extractedText = [];
let fileNames = [];

textarea.addEventListener("dragover", function(event) {
    event.preventDefault();
});

textarea.addEventListener("drop", async function(event) {
    event.preventDefault()

    const file = event.dataTransfer.files[0];
    console.log(file);

    if (file.type !== "application/pdf"){
        alert("Endas PDF-filer stöds just nu!");
        return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
    }

    extractedText.push(text);
    fileNames.push(file.name);
    textarea.value = "";
    textarea.placeholder = "Klistra in din text eller släpp din fil här!";
    fileInfo.style.display = "block";
    renderFileInfo();
    
})

function renderFileInfo() {
    fileInfo.innerHTML = "";
    fileNames.forEach(function(name,index) {
        const item = document.createElement("span");
        item.textContent = "📄 " + name;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = function() {
            fileNames.splice(index, 1);
            extractedText.splice(index, 1);
            if (fileNames.length === 0) {
                fileInfo.style.display = "none";
            } else {
                renderFileInfo();
            }
        };
        
        item.appendChild(removeBtn);
        fileInfo.appendChild(item);
    });
}



button.addEventListener("click", async function () {
    const text = extractedText.join("\n\n") || textarea.value;
   
    if (text.trim() === "") {
        alert("Klistra in din text innan du sammanfattar!");
        return
    }
    
    button.disabled = true;
    resultat.textContent = "Sammanfattar";

    try {
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama3.2",
            prompt: "Sammanfatta följande texter på svenska " + text,
            stream: false
        })
    });

    const data = await response.json();
    resultat.textContent = data.response;
} catch (error) {
    resultat.textContent = "Något gick fel. Kontrollera att Ollama körs.";
    console.error(error);
} finally {
    button.disabled = false; 
}
    

});