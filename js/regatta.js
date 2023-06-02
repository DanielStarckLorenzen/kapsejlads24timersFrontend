const createRegattaUrl = "http://localhost:8080/regatta";
const getAllRegattasUrl = "http://localhost:8080/regattas";
const deleteRegattaUrl = "http://localhost:8080/removeRegatta";
const updateRegattaUrl = "http://localhost:8080/updateRegatta";

function postRegatta(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    });
}

async function createRegatta() {
    const regattaName = document.getElementById("regattaName").value;
    const regattaType = document.getElementById("regattaType").value;

    const regatta = {
        name: regattaName,
        size: regattaType,
        isFinished: false
    };

    postRegatta(createRegattaUrl, JSON.stringify(regatta));

}

async function loadRegattas() {
    const allRegattas = await fetch(getAllRegattasUrl);
    const regattas = await allRegattas.json();

    const allParticipants = await fetch(getAllParticipantsUrl);
    const participants = await allParticipants.json();

    const regattaTable = document.getElementById("regattaTable");
    const regattaTableBody = document.getElementById("regattaTableBody");
    regattaTableBody.innerHTML = "";

    regattas.forEach(regatta => {
        const row = document.createElement("tr");

        // Create ID cell
        const cell = document.createElement("td");
        cell.innerHTML = regatta.id;
        row.appendChild(cell);

        // Create Name cell
        const cell2 = document.createElement("td");
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.id = `regattaName_${regatta.id}`;
        nameInput.name = "regattaName";
        nameInput.value = regatta.name;
        cell2.appendChild(nameInput);
        row.appendChild(cell2);

        // Create Type cell
        const cell3 = document.createElement("td");
        cell3.innerHTML = regatta.size;
        row.appendChild(cell3);

        // Create Participants cell
        const regattaParticipants = participants.filter(participant => participant.regatta.id === regatta.id);
        // Sort participants by points
        regattaParticipants.sort((a, b) => a.points - b.points);
        console.log(regattaParticipants);
        for (let i = 0; i < 3; i++) {
            const cellPlaces = document.createElement("td");
            if (i < regattaParticipants.length) {
                cellPlaces.innerHTML = "Båd-" + regattaParticipants[i].boat.id;
            } else {
                cellPlaces.innerHTML = ""; // Empty cell
            }
            row.appendChild(cellPlaces);
        }


        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Slet";
        deleteButton.addEventListener("click", () => {
            deleteRegatta(regatta.id, participants);
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        const editCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.innerHTML = "Rediger";
        editButton.addEventListener("click", () => {
            editRegatta(regatta.id);
        });
        editCell.appendChild(editButton);
        row.appendChild(editCell);


        regattaTableBody.appendChild(row);
    });

}

function deleteRegatta(id, participants) {
    const deleteParticipantPromises = participants.map(participant => {
        if (participant.regatta.id === id) {
            return fetch(deleteParticipantUrl + "/" + participant.id, {
                method: "POST"
            });
        }
    });

    Promise.all(deleteParticipantPromises)
        .then(() => {
            return fetch(deleteRegattaUrl + "/" + id, {
                method: "POST"
            });
        })
        .then(() => {
            loadRegattas();
        })
        .catch(error => {
            console.error("Error deleting regatta:", error);
        });
}

function editRegatta(id) {
    const regattaName = document.getElementById(`regattaName_${id}`).value;
    const regattaType = document.getElementById("regattaType").value;

    const regatta = {
        id: id,
        name: regattaName,
        size: regattaType
    };

    fetch(createRegattaUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(regatta)
    })
        .then(() => {
            loadRegattas();
        })
        .catch(error => {
            console.error("Error editing regatta:", error);
        });
}


