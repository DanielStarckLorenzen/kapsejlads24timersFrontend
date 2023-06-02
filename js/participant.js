const createParticipantUrl = "http://localhost:8080/participant";
const getAllParticipantsUrl = "http://localhost:8080/participants";
const deleteParticipantUrl = "http://localhost:8080/removeParticipant";
const updateParticipantUrl = "http://localhost:8080/updateParticipant";

function postParticipant(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    });
}

async function createParticipants() {
    const participants = document.getElementById("boatTableBody").children;
    const participantsArray = [];
    let boatId = 0;
    let points = 0;
    const regattaId = document.getElementById("allRegattasToAdd").value;
    const regattaName = document.getElementById("allRegattasToAdd").options[document.getElementById("allRegattasToAdd").selectedIndex].text;
    for (let i = 0; i < participants.length; i++) {
        if (i > 0) {
            participantsArray.push(participants[i].id);
            boatId = participants[i].id;
            const finishedId = `finished${boatId}`;
            const finished = document.getElementById(finishedId).value;
            if (finished === "dnf" || finished === "early") {
                points = participants.length;
                alert(points)
            } else if (finished === "dns") {
                points = participants.length + 1;
                alert(points)
            } else {
                points = i;
            }

            let participant = {
                points: points
            }

            postParticipant(createParticipantUrl + "/" + boatId + "/" + regattaId, JSON.stringify(participant));
        }
    }
    let regatta = {
        id: regattaId,
        name: regattaName,
        isFinished: true
    }

    postRegatta(updateRegattaUrl, JSON.stringify(regatta));

}

async function addAvailableBoatsToDropdown(size) {
    const boatSelect = document.getElementById("allBoatsToAdd");
    boatSelect.innerHTML = "";
    const allBoats = await fetch(getAllBoatsUrl);
    const boats = await allBoats.json();
    boats.filter(boat => boat.size === size).forEach(boat => {
        const option = document.createElement("option");
        option.value = boat.id;
        option.textContent = boat.id;
        boatSelect.appendChild(option);
    });
}

async function addRegattasToDropdown() {
    const regattaSelect = document.getElementById("allRegattasToAdd");
    regattaSelect.innerHTML = "";
    const allRegattas = await fetch(getAllRegattasUrl);
    const regattas = await allRegattas.json();
    console.log(regattas)
    regattas.forEach(regatta => {
        const option = document.createElement("option");
        option.value = regatta.id;
        console.log(regatta.size);
        option.setAttribute("size", regatta.size);
        option.textContent = regatta.name;
        regattaSelect.appendChild(option);
    });
}

async function getBoatById(id) {
    const boat = await fetch(getBoatUrl + "/" + id);
    return await boat.json();
}

function loadParticipants() {
    addRegattasToDropdown();

    showAllParticipants();

    const regattaSelect = document.getElementById("allRegattasToAdd");
    regattaSelect.addEventListener("change", () => {
        const option = regattaSelect.options[regattaSelect.selectedIndex];
        console.log(option.getAttribute("size"));
        addAvailableBoatsToDropdown(option.getAttribute("size"));
    });

    const addBoatButton = document.getElementById("addBoatButton");
    addBoatButton.addEventListener("click", async () => {
        const boatSelect = document.getElementById("allBoatsToAdd");
        const boatId = boatSelect.value;
        console.log(boatId)
        const boat = await getBoatById(boatId);
        addBoatToRegatta(boat);
    });

}

function addBoatToRegatta(boat) {
    const boatTableBody = document.getElementById("boatTableBody");
    const boatRows = boatTableBody.getElementsByClassName("boat-table-row");

    const boatElement = document.createElement("div");
    boatElement.id = boat.id;
    boatElement.className = "boat-table-row";
    boatElement.draggable = true;
    boatElement.ondragstart = drag;
    boatElement.ondragover = allowDrop;
    boatElement.ondrop = drop;

    const finishedId = `finished${boat.id}`;

    boatElement.innerHTML = `
    <div class="boat-table-cell">${boat.id}</div>
    <div class="boat-table-cell">
      <select id="${finishedId}">
        <option value="fin" selected>Fuldført</option>
        <option value="dnf">Ikke Fuldørt</option>
        <option value="early">For Tidlig Startet</option>
        <option value="dns">Ikke Startet</option>
      </select>
    </div>
    <div class="boat-table-cell"><button type="button" onclick="removeBoatFromRegatta(${boat.id})">Fjern</button></div>
  `;
    boatTableBody.appendChild(boatElement);

}

function removeBoatFromRegatta(boatId) {
    const boatElement = document.getElementById(boatId);
    boatElement.remove();
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const boatId = event.dataTransfer.getData("text/plain");
    const boatElement = document.getElementById(boatId);
    const targetElement = event.target.closest('.boat-table-row');

    if (targetElement) {
        const targetParent = targetElement.parentElement;
        const targetIndex = Array.from(targetParent.children).indexOf(targetElement);

        const boatParent = boatElement.parentElement;
        const boatIndex = Array.from(boatParent.children).indexOf(boatElement);

        if (targetParent === boatParent && targetIndex > boatIndex) {
            targetParent.insertBefore(boatElement, targetElement.nextSibling);
        } else {
            targetParent.insertBefore(boatElement, targetElement);
        }
    }
}

async function showAllParticipants() {
    const allParticipants = await fetch(getAllParticipantsUrl);
    const participants = await allParticipants.json();

    const allRegattas = await fetch(getAllRegattasUrl);
    const regattas = await allRegattas.json();

    const allBoats = await fetch(getAllBoatsUrl);
    const boats = await allBoats.json();

    const participantsTableHeadRow = document.getElementById("participantsTableHeadRow");
    const participantsTableBody = document.getElementById("participantsTableBody");

    for (let i = 0; i < regattas.length; i++) {
        const regatta = regattas[i];
        const th = document.createElement("th");
        th.textContent = regatta.name;
        participantsTableHeadRow.appendChild(th);
    }

    const thDelete = document.createElement("th");
    thDelete.textContent = "Slet";
    participantsTableHeadRow.appendChild(thDelete);

    const thEdit = document.createElement("th");
    thEdit.textContent = "Rediger";
    participantsTableHeadRow.appendChild(thEdit);

    for (let boat of boats) {
        let totalPoints = 0;
        for (let participant of participants) {
            if (participant.boat.id === boat.id) {
                totalPoints += participant.points;
                console.log(boat.id + " " + totalPoints)
            }
        }
        //Sort boats after total points
        boats.sort((a, b) => {
            let totalPointsA = 0;
            let totalPointsB = 0;
            for (let participant of participants) {
                if (participant.boat.id === a.id) {
                    totalPointsA += participant.points;
                }
                if (participant.boat.id === b.id) {
                    totalPointsB += participant.points;
                }

            }
            // Compare the total points
            if (totalPointsA === totalPointsB) {
                return 0;
            } else if (totalPointsA === 0) {
                return 1;
            } else if (totalPointsB === 0) {
                return -1;
            } else {
                return totalPointsA - totalPointsB;
            }
        });
    }

    for (let i = 0; i < boats.length; i++) {
        const boat = boats[i];
        let totalPoints = 0;
        for (let participant of participants) {
            if (participant.boat.id === boat.id) {
                totalPoints += participant.points;
                console.log(boat.id + " " + totalPoints)
            }
        }

        const tr = document.createElement("tr");
        tr.id = boat.id;
        tr.className = "participants-table-row";

        const td = document.createElement("td");
        console.log(boat.id);
        td.textContent = boat.id;
        tr.appendChild(td);

        const td2 = document.createElement("td");
        td2.textContent = totalPoints;
        tr.appendChild(td2);

        for (let j = 0; j < regattas.length; j++) {
            const regatta = regattas[j];
            const td = document.createElement("td");
            const participant = participants.find(participant => participant.boat.id === boat.id && participant.regatta.id === regatta.id);
            if (participant) {
                const pointInput = document.createElement("input");
                pointInput.type = "number";
                pointInput.id = `points-${participant.id}`;
                pointInput.value = participant.points;
                td.id = `participated-${participant.id}`;
                td.appendChild(pointInput);
            } else {
                td.id = `not-participated-${boat.id}-${regatta.id}`;
                td.textContent = "-";
            }
            tr.appendChild(td);
        }

        const tdDelete = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Slet";
        deleteButton.addEventListener("click", function () {
            const participant = participants.find(participant => participant.boat.id === boat.id);
            deleteParticipant(participant.id);
        });
        tdDelete.appendChild(deleteButton);
        tr.appendChild(tdDelete);

        const tdEdit = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Rediger";
        editButton.addEventListener("click", function () {
            const participant = participants.find(participant => participant.boat.id === boat.id);
            const points = document.getElementById(`points-${participant.id}`).value;
            editParticipant(participant.id, points);
        });
        tdEdit.appendChild(editButton);
        tr.appendChild(tdEdit);


        participantsTableBody.appendChild(tr);
    }
}

function deleteParticipant(participantId) {
    fetch(deleteParticipantUrl + "/" + participantId, {
        method: "POST"
    });
    location.reload();
}

function editParticipant(participantId, points) {
    let participant = {
        points: points
    }

    postParticipant(updateParticipantUrl + "/" + participantId, JSON.stringify(participant));

    location.reload();
}

async function createParticipantForAllRegattas(boatSize, boatId) {
    const allRegattas = await fetch(getAllRegattasUrl);
    const regattas = await allRegattas.json();

    for (let i = 0; i < regattas.length; i++) {
        if (regattas[i].size === boatSize) {
            const participant = {
                points: 0
            }
            postParticipant(createParticipantUrl + "/" + boatId + "/" + regattas[i].id, JSON.stringify(participant));
        }
    }
}