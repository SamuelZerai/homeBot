const button = document.getElementById("summarize-btn");
const textarea = document.getElementById("text-input");
const resultat = document.getElementById("resultat");
textarea.addEventListener("dragover", function(event) {
    event.preventDefault();
});


textarea.addEventListener("drop", function(event) {
    event.preventDefault()

    const file = event.dataTransfer.files[0];
    console.log(file);
})



button.addEventListener("click", async function () {
    const text = textarea.value;
   
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