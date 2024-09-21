const dataAtual = new Date();

document.addEventListener('DOMContentLoaded', function () {
    // Limpa o localStorage no dia 1 do mês
    if (dataAtual.getDate() === 1) {
        localStorage.clear();
    }
});

document.getElementById('data').addEventListener('click', function() {
    this.showPicker(); // Força a abertura do calendário
});

function formatarMoeda(valor) {
    valor = valor.replace(/\D/g, "");
    valor = (valor / 100).toFixed(2) + "";
    valor = valor.replace(".", ",");
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return valor;
}

document.getElementById('ganhos').addEventListener('input', function (event) {
    const input = event.target;
    input.value = formatarMoeda(input.value);
});

document.getElementById('gastos').addEventListener('input', function (event) {
    const input = event.target;
    input.value = formatarMoeda(input.value);
});

document.getElementById('resultadoForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const data = document.getElementById('data').value;
    let ganhos = document.getElementById('ganhos').value;
    let gastos = document.getElementById('gastos').value;
    const errorMessage = document.getElementById('errorMessage');

    ganhos = ganhos.replace(/\./g, '').replace(',', '.');
    gastos = gastos.replace(/\./g, '').replace(',', '.');

    if (!data || !ganhos || parseFloat(ganhos) < 0 || !gastos || parseFloat(gastos) < 0) {
        errorMessage.textContent = "Por favor, preencha todos os campos corretamente.";
        return;
    }

    const resultado = {
        data: data,
        ganhos: parseFloat(ganhos),
        gastos: parseFloat(gastos)
    };
    localStorage.setItem(`resultado_${data}`, JSON.stringify(resultado));

    errorMessage.textContent = "";
    alert('Salvo com sucesso!');
    document.getElementById('resultadoForm').reset();
});

function gerarRelatorio() {
    const resultados = Object.keys(localStorage)
        .filter(key => key.startsWith('resultado_'))
        .map(key => JSON.parse(localStorage.getItem(key)))
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    if (resultados.length === 0) {
        alert('Nenhum resultado encontrado.');
        return;
    }

    let ganhosSemanal = 0;
    let gastosSemanal = 0;
    let ganhosMensal = 0;
    let gastosMensal = 0;

    const primeiroDiaDaSemana = new Date(dataAtual);
    primeiroDiaDaSemana.setDate(dataAtual.getDate() - dataAtual.getDay()); // Domingo da semana atual

    const ultimoDiaDaSemana = new Date(primeiroDiaDaSemana);
    ultimoDiaDaSemana.setDate(primeiroDiaDaSemana.getDate() + 7); // Último dia da semana atual

    var mesAtual = dataAtual.getMonth();

    resultados.forEach(r => {
        const dataResultado = new Date(r.data);
        dataResultado.setDate(dataResultado.getDate() + 2);

        if (dataResultado >= primeiroDiaDaSemana && dataResultado <= ultimoDiaDaSemana && dataResultado.getMonth() === mesAtual) {
            ganhosSemanal += r.ganhos;
            gastosSemanal += r.gastos;
        }
        if (dataResultado.getMonth() === mesAtual) {
            ganhosMensal += r.ganhos;
            gastosMensal += r.gastos;
        }
    });

    const relatorioResultado = document.getElementById('relatorioResultado');

    // Formatação do mês atual
    mesAtual = dataAtual.toLocaleString('pt-BR', { month: 'long' });

    // Cálculo do lucro
    const lucroSemanal = ganhosSemanal - gastosSemanal;
    const lucroMensal = ganhosMensal - gastosMensal;

    // Determinando a classe de estilo
    const lucroClassSemanal = lucroSemanal < 0 ? 'negativo' : 'positivo';
    const lucroClassMensal = lucroMensal < 0 ? 'negativo' : 'positivo';

    relatorioResultado.innerHTML = `
        <h2>Relatório - ${mesAtual}</h2>
        <hr/>
        <table>
            <tr>
                <th></th>
                <th>Semana (R$)</th>
                <th>Mês (R$)</th>
            </tr>
            <tr>
                <td>Ganhos</td>
                <td>${ganhosSemanal.toFixed(2).replace('.', ',')}</td>
                <td>${ganhosMensal.toFixed(2).replace('.', ',')}</td>
            </tr>
            <tr>
                <td>Gastos</td>
                <td>${gastosSemanal.toFixed(2).replace('.', ',')}</td>
                <td>${gastosMensal.toFixed(2).replace('.', ',')}</td>
            </tr>
            <tr class="lucro">
                <td>Lucro</td>
                <td class="${lucroClassSemanal}">${lucroSemanal.toFixed(2).replace('.', ',')}</td>
                <td class="${lucroClassMensal}">${lucroMensal.toFixed(2).replace('.', ',')}</td>
            </tr>
        </table>
    `;

    document.getElementById('modal').style.display = 'block'; // Exibir o modal
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none'; // Ocultar o modal
}

// Fechar o modal quando clicar fora dele
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
