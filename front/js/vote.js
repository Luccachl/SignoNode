const apiUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", loadPolls);

function loadPolls() {
  fetch(`${apiUrl}/polls`)
    .then((response) => response.json())
    .then((polls) => {
      const pollsDiv = document.getElementById("polls");
      pollsDiv.innerHTML = "";

      if (polls.length === 0) {
        pollsDiv.innerHTML = "<p>Sem Enquetes Disponíveis no Momento</p>";
        return;
      }

      polls.forEach((poll) => {
        const now = new Date();
        const startDate = new Date(poll.start_date);
        const endDate = new Date(poll.end_date);
        const isActive = now >= startDate && now <= endDate;

        const pollDiv = document.createElement("div");
        pollDiv.innerHTML = `
          <h3>${poll.title}</h3>
          <p>Início: ${startDate.toLocaleString()}</p>
          <p>Término: ${endDate.toLocaleString()}</p>
          ${isActive ? "" : "<p>Enquete encerrada</p>"}
          <div id="options-${poll.id}"></div>
          <button onclick="vote(${poll.id})" ${isActive ? "" : "disabled"}>Votar</button>
        `;
        pollsDiv.appendChild(pollDiv);

        loadOptions(poll.id, isActive);
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar enquetes:", error);
      const pollsDiv = document.getElementById("polls");
      pollsDiv.innerHTML = "<p>Erro ao carregar enquetes. Tente novamente mais tarde.</p>";
    });
}

function loadOptions(pollId, isActive) {
  fetch(`${apiUrl}/polls/${pollId}`)
    .then((response) => response.json())
    .then((poll) => {
      const optionsDiv = document.getElementById(`options-${pollId}`);
      poll.options.forEach((option) => {
        const optionDiv = document.createElement("div");
        optionDiv.innerHTML = `
          <input type="radio" name="poll-${pollId}" value="${option.id}" ${isActive ? "" : "disabled"}>
          ${option.option_text} (${option.votes} votos)
        `;
        optionsDiv.appendChild(optionDiv);
      });
    })
    .catch((error) => console.error("Erro ao carregar opções:", error));
}

function vote(pollId) {
  const selectedOption = document.querySelector(`input[name="poll-${pollId}"]:checked`);
  if (!selectedOption) {
    alert("Selecione uma opção para votar.");
    return;
  }

  fetch(`${apiUrl}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionId: selectedOption.value }),
  })
    .then(() => {
      alert("Voto registrado com sucesso.");
      loadPolls();
    })
    .catch((error) => console.error("Erro ao registrar voto:", error));
}

function savePollChanges(pollId) {
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
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.textContent = "Salvar Enquete";
        submitButton.onclick = (event) => {
          event.preventDefault();
          createPoll();
        };
      })
      .catch((error) => {
        console.error("Erro ao atualizar a enquete:", error);
        alert("Erro ao atualizar a enquete.");
      });
  }
  