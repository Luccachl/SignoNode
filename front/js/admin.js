const apiUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", loadPolls);

function loadPolls() {
  fetch(`${apiUrl}/polls`)
    .then((response) => response.json())
    .then((polls) => {
      const pollsDiv = document.getElementById("polls");
      pollsDiv.innerHTML = ""; 

      polls.forEach((poll) => {
        const pollDiv = document.createElement("div");
        pollDiv.innerHTML = `
          <h3>${poll.title}</h3>
          <p>Início: ${new Date(poll.start_date).toLocaleString()}</p>
          <p>Término: ${new Date(poll.end_date).toLocaleString()}</p>
          <p>Opções:</p>
          <div id="options-${poll.id}" class="options"></div>
          <button onclick="editPoll(${poll.id})">Editar</button>
          <button onclick="deletePoll(${poll.id})">Excluir</button>
          <hr>
        `;
        pollsDiv.appendChild(pollDiv);

        loadOptions(poll.id);
      });
    })
    .catch((error) => console.error("Erro ao carregar enquetes:", error));
}

function loadOptions(pollId) {
  fetch(`${apiUrl}/polls/${pollId}`)
    .then((response) => response.json())
    .then((poll) => {
      const optionsDiv = document.getElementById(`options-${pollId}`);
      optionsDiv.innerHTML = ""; // Limpar opções anteriores

      poll.options.forEach((option) => {
        const optionDiv = document.createElement("div");
        optionDiv.textContent = `${option.option_text} - ${option.votes} votos`;
        optionsDiv.appendChild(optionDiv);
      });
    })
    .catch((error) => console.error("Erro ao carregar opções:", error));
}

function deletePoll(pollId) {
  fetch(`${apiUrl}/polls/${pollId}`, { method: "DELETE" })
    .then(() => {
      alert("Enquete excluída com sucesso.");
      loadPolls();
    })
    .catch((error) => console.error("Erro ao excluir enquete:", error));
}

document.getElementById("poll-form").addEventListener("submit", (event) => {
    event.preventDefault(); 
    
    const title = document.getElementById("title").value;
    let end_date = document.getElementById("end_date").value;
    const options = Array.from(document.querySelectorAll("#options input"))
      .map((input) => input.value)
      .filter((value) => value.trim());
  
    if (!title || !end_date || options.length < 3) {
      alert("Todos os campos devem ser preenchidos e deve haver pelo menos 3 opções.");
      return;
    }
  
    if (end_date) {
      end_date = end_date + ":00";
    }
  
    console.log("Dados a serem enviados para o servidor:");
    console.log({ title, end_date, options });
  
    if (event.target.textContent === "Salvar Alterações") {
      updatePoll(event.target.dataset.pollId);
    } else {
      fetch(`${apiUrl}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, end_date, options }),
      })
        .then((response) => response.json())
        .then(() => {
          alert("Enquete criada com sucesso.");
          loadPolls();
          document.getElementById("poll-form").reset();
        })
        .catch((error) => {
          console.error("Erro ao criar enquete:", error);
          alert("Erro ao criar enquete.");
        });
    }
  });
  
  
  
  
document.getElementById("add-option").addEventListener("click", () => {
  const optionsDiv = document.getElementById("options");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Opção ${optionsDiv.children.length + 1}`;
  optionsDiv.appendChild(input);
});

function editPoll(pollId) {
    fetch(`${apiUrl}/polls/${pollId}`)
      .then((response) => response.json())
      .then((poll) => {
        document.getElementById("title").value = poll.title;
        document.getElementById("end_date").value = new Date(new Date(poll.end_date).getTime() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);//foi o jeito para deixar no fuso do BR
      
        const optionsDiv = document.getElementById("options");
        optionsDiv.innerHTML = "";
        poll.options.forEach((option, index) => {
          const input = document.createElement("input");
          input.type = "text";
          input.value = option.option_text;
          input.placeholder = `Opção ${index + 1}`;
          optionsDiv.appendChild(input);
          optionsDiv.appendChild(document.createElement("br"));
        });
        //botão muda
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.textContent = "Salvar Alterações";
        submitButton.onclick = (event) => {
          event.preventDefault();
          updatePoll(pollId);
        };
      })
      .catch((error) => console.error("Erro ao carregar a enquete:", error));
  }
  
  function updatePoll(pollId) {
    const title = document.getElementById("title").value;
    const end_date = document.getElementById("end_date").value;
    const options = Array.from(document.querySelectorAll("#options input"))
      .map((input) => input.value)
      .filter((value) => value.trim());
  
    if (!title || !end_date || options.length < 3) {
      alert("Todos os campos devem ser preenchidos e deve haver pelo menos 3 opções.");
      return;
    }
  

    fetch(`${apiUrl}/polls/${pollId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, end_date, options }),
    })
      .then(() => {
        alert("Enquete atualizada com sucesso.");
        loadPolls(); 
        document.getElementById("poll-form").reset();
        const submitButton = document.querySelector("#poll-form button[type='submit']");
        submitButton.textContent = "Salvar Enquete";//botão desmuda
      })
      .catch((error) => {
        console.error("Erro ao atualizar enquete:", error);
        alert("Erro ao atualizar enquete.");
      });
  }
  