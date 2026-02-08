const form = document.getElementById("pcForm");
const totalSpan = document.getElementById("total");
const totalHidden = document.getElementById("total_hidden");

form.addEventListener("change", calcularTotal);

function calcularTotal() {
    let total = 0;
    ["cpu", "gpu", "ram", "ssd"].forEach(tipo => {
        const select = document.getElementById(tipo);
        const valor = parseFloat(select.value);
        const nomeInput = document.getElementById(tipo + "_nome");
        nomeInput.value = select.options[select.selectedIndex].dataset.nome || '';
        if (!isNaN(valor)) total += valor;
    });
    totalSpan.textContent = total.toFixed(2);
    totalHidden.value = total.toFixed(2);
}

// O envio agora é normal via POST
