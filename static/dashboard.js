//async function searchResearchCenters(query) {
    //const response = await fetch(BASE_URL + '/query?q=' + encodeURIComponent(query));
//}

const nameInput = document.getElementById("nameSearchInput");
const suggestionBox = document.getElementById("suggestionBox");

// debounce helper (avoid hammering backend)
let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

nameInput.addEventListener("input", () => {
  debounce(async () => {
    const query = nameInput.value.trim();
    if (!query) {
      suggestionBox.innerHTML = "";
      return;
    }

    const res = await fetch(BASE_URL + `/query/suggest?q=${encodeURIComponent(query)}`);
    const suggestions = await res.json();

    suggestionBox.innerHTML = "";
    suggestions.forEach(s => {
      const div = document.createElement("div");
      div.textContent = s;
      div.onclick = () => {
        nameInput.value = s;
        suggestionBox.innerHTML = "";
      };
      suggestionBox.appendChild(div);
    });
  }, 200);
});

async function displayAllResearchCenters() {
    const response = await fetch(BASE_URL + '/query/all');
    const data = await response.json();
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';

    data.forEach((center) => { // Add a list element to it for each event extracted before
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${center.Entitate}</strong><br>
                Proiecte finantate: ${center.Nr_proiecte_finantate}<br>
                Abreviere: ${center.Abreviere}<br>
                Tip: ${center.Attribute_tip_institutie_original}<br>
                Regiune: ${center.Reg_dezvoltare}<br>
                Pr_instit_coordonatoare: ${center.Pr_instit_coordonatoare}<br>
                Pr_instit_total: ${center.Pr_instit_total}<br>
                merge1_degree: ${center.merge1_degree}<br>
                Eigenvcentral_gephi: ${center.Eigenvcentral_gephi}<br>
                Closeness_central_gephi: ${center.Closeness_central_gephi}<br>
                Beetweeness_gephi: ${center.Beetweeness_gephi}<br>
                Weighteddegree_Gephi: ${center.Weighteddegree_Gephi}<br>
                Authority: ${center.Authority}<br>
            `;
            resultsList.appendChild(li);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    displayAllResearchCenters();
});

async function plotDynamic() {
    const params = new URLSearchParams({
        x: document.getElementById("xAxis").value,
        y: document.getElementById("yAxis").value,
        highlight: document.getElementById("nameSearchInput").value
    });

    const filterCol = document.getElementById("filterColumn").value;
    const filterVal = document.getElementById("filterValue").value;
    
    if (filterCol && filterVal) {
        params.append(filterCol, filterVal); // This sends the column name directly as a parameter
    }

    const response = await fetch(`/query/dynamic?${params}`);
    const data = await response.json();

    // Default trace for all universities
    const traceAll = {
        x: data.x,
        y: data.y,
        text: data.labels,
        mode: 'markers',
        type: 'scatter',
        marker: { size: 8, color: 'blue' },
        name: "All Universities"
    };

    let traces = [traceAll];

    // Add highlight trace if found
    if (data.highlight) {
        const idx = data.labels.findIndex(l => l.includes(data.highlight));
        if (idx !== -1) {
            traces.push({
                x: [data.x[idx]],
                y: [data.y[idx]],
                text: [data.labels[idx]],
                mode: 'markers+text',
                type: 'scatter',
                marker: { size: 14, color: 'red' },
                textposition: 'top center',
                name: `Highlight: ${data.labels[idx]}`
            });
        }
    }

    Plotly.react("chart", traces, {
        title: `${data.y_name || "Y"} vs ${data.x_name || "X"}`
    });
}

document.getElementById("plotButton").addEventListener("click", plotDynamic);