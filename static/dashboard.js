const DISPLAY_TO_COLUMN = {
    'Nume Instituție': 'Entitate',
    'Număr Proiecte Finanțate': 'Nr_proiecte_finantate',
    'Abreviere': 'Abreviere',
    'Tip Instituție': 'Attribute_tip_institutie_original',
    'Regiune Dezvoltare': 'Reg_dezvoltare',
    'Proiecte ca Coordonator': 'Pr_instit_coordonatoare',
    'Proiecte Total': 'Pr_instit_total',
    'Grad Conexiuni': 'merge1_degree',
    'Centralitate Eigenvector': 'Eigenvcentral_gephi',
    'Centralitate Proximitate': 'Closeness_central_gephi',
    'Centralitate Intermediere': 'Beetweeness_gephi',
    'Grad Ponderat': 'Weighteddegree_Gephi',
    'Autoritate': 'Authority'
};

function setupAutocomplete(inputId, apiEndpoint, useMapping = false) {
  const input = document.getElementById(inputId);
  if (!input) return; 
  
  const container = input.parentElement;
  const suggestionBox = container.querySelector('.suggestionBox');
  
  let debounceTimer;
  
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const query = input.value.trim();
      
      if (!query) {
        suggestionBox.innerHTML = "";
        return;
      }

      try {
        const res = await fetch(`${apiEndpoint}?q=${encodeURIComponent(query)}`);
        const suggestions = await res.json();

        suggestionBox.innerHTML = "";
        
        suggestions.forEach(s => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.textContent = s;
          
          div.onclick = () => {
            input.value = s;
            suggestionBox.innerHTML = "";
          };
          
          suggestionBox.appendChild(div);
        });
      } catch (error) {
        console.error(`Error fetching suggestions for ${inputId}:`, error);
      }
    }, 200);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      suggestionBox.innerHTML = "";
    }
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest('.search-container')) {
    document.querySelectorAll('.suggestionBox').forEach(box => {
      box.innerHTML = "";
    });
  }
});

async function displayAllResearchCenters() {
    const response = await fetch(BASE_URL + '/query/all');
    const data = await response.json();
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';

    data.forEach((center) => {
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

async function plotDynamic() {
    const xDisplay = document.getElementById("xAxis").value;
    const yDisplay = document.getElementById("yAxis").value;
    
    const xCol = DISPLAY_TO_COLUMN[xDisplay] || xDisplay;
    const yCol = DISPLAY_TO_COLUMN[yDisplay] || yDisplay;
    
    const params = new URLSearchParams({
        x: xCol,
        y: yCol,
        highlight: document.getElementById("nameSearchInput").value
    });

    const response = await fetch(BASE_URL + `/query/dynamic?${params}`);
    const data = await response.json();

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
        title: `${yDisplay} vs ${xDisplay}`
    });
}

document.addEventListener("DOMContentLoaded", () => {
  setupAutocomplete("nameSearchInput", "/query/suggest/name");
  setupAutocomplete("xAxis", "/query/suggest/column");
  setupAutocomplete("yAxis", "/query/suggest/column");
  
  //displayAllResearchCenters();
  
  const plotButton = document.getElementById("plotButton");
  if (plotButton) {
    plotButton.addEventListener("click", plotDynamic);
  }
});