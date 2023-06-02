const createBoatUrl = "http://localhost:8080/boat";
const getAllBoatsUrl = "http://localhost:8080/boats";
const deleteBoatUrl = "http://localhost:8080/removeBoat";
const getBoatUrl = "http://localhost:8080/boat";

function postBoat(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .catch(error => {
            console.error('Error posting boat:', error);
            throw error;
        });
}

function createBoat() {
    const selectElement = document.getElementById("boatSize");
    const selectedValue = selectElement.value;


    const boat = {
        size: selectedValue
    };

    postBoat(createBoatUrl, JSON.stringify(boat));

}

async function getBoats() {
    const allBoats = await fetch(getAllBoatsUrl);
    const boats = await allBoats.json();
    console.log(boats);

    const boatTable = document.getElementById("boatTable");
    const boatTableBody = document.getElementById("boatTableBody");
    boatTableBody.innerHTML = "";

    boats.forEach(boat => {
        const row = document.createElement("tr");

        // Create ID cell
        const cell = document.createElement("td");
        cell.innerHTML = boat.id;
        row.appendChild(cell);

        // Create Size cell
        const cell2 = document.createElement("td");
        const selectElement = document.createElement("select");
        selectElement.id = `boatSize_${boat.id}`;
        selectElement.name = "boatSize";
        selectElement.required = true;

        // Create option elements
        const optionSmall = document.createElement("option");
        optionSmall.value = "SMALL";
        optionSmall.textContent = "Lille";
        const optionMedium = document.createElement("option");
        optionMedium.value = "MEDIUM";
        optionMedium.textContent = "Mellem";
        const optionLarge = document.createElement("option");
        optionLarge.value = "LARGE";
        optionLarge.textContent = "Stor";

        // Append options to select element
        selectElement.appendChild(optionSmall);
        selectElement.appendChild(optionMedium);
        selectElement.appendChild(optionLarge);

        // Set selected value
        selectElement.value = boat.size;
        selectElement.id = `boatSize_${boat.id}`;

        // Append select element to cell
        cell2.appendChild(selectElement);
        row.appendChild(cell2);

        const addToAllRegattasCell = document.createElement("td");
        const addToAllRegattasCheckbox = document.createElement("input");
        addToAllRegattasCheckbox.type = "checkbox";
        addToAllRegattasCheckbox.id = `addToAllRegattas_${boat.id}`;
        addToAllRegattasCheckbox.name = "addToAllRegattas";
        addToAllRegattasCheckbox.value = "false";
        addToAllRegattasCell.appendChild(addToAllRegattasCheckbox);
        row.appendChild(addToAllRegattasCell);

        // Create Delete button cell
        const cell3 = document.createElement("td");
        cell3.innerHTML = `<button type="button" id="deleteBoat" onclick="deleteBoat(${boat.id})">Slet</button>`;
        row.appendChild(cell3);

        // Create Edit button cell
        const cell4 = document.createElement("td");
        cell4.innerHTML = `<button type="button" id="editBoat" onclick="editBoat(${boat.id})">Rediger</button>`;
        row.appendChild(cell4);

        boatTableBody.appendChild(row);
    });
    boatTable.appendChild(boatTableBody);
}

function deleteBoat(id) {
     fetch(deleteBoatUrl + "/" + id, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
     });

     location.reload();

}

function editBoat(id) {
    const selectElement = document.getElementById(`boatSize_${id}`);
    const selectedValue = selectElement.value;

    const boat = {
        id: id,
        size: selectedValue
    };

    postBoat(createBoatUrl, JSON.stringify(boat));

    const addToAllRegattasCheckbox = document.getElementById(`addToAllRegattas_${id}`);
    if (addToAllRegattasCheckbox.checked) {
        addToAllRegattasCheckbox.value = true;
        createParticipantForAllRegattas(selectedValue, id);
    }

}