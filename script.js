const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2305-FTB-ET-WEB-PT';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(APIURL+'/players');
        const data = await response.json();
        console.log(data);
        return data.data.players;
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
        return [];
    }
};


const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(APIURL+'/players/' + playerId);
        const data = await response.json();
        return data.data.player;
    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
        return null;
    }
};


const addNewPlayer = async (playerObj) => {
    try {
        const response = await fetch(APIURL+'/players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerObj),
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
        return null;
    }
};


const removePlayer = async (playerId) => {
    try {
        await fetch(APIURL+'/players/' + playerId, {
            method: 'DELETE',
        });
    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};


/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
    try {
        console.log(playerList);
        const playerContainerHTML = playerList.map((player) => `
            <div class="player-card">
            <img src="${player.imageUrl}" alt="${player.name}" class="player-image">
                <h2>${player.name}</h2>
                <p>Breed: ${player.breed}</p>
                <p>Status: ${player.status}</p>
                <button class="view-details" data-id="${player.id}">View Details</button>
                <button class="remove-player" data-id="${player.id}">Remove Player</button>
            </div>
        `).join('');

        playerContainer.innerHTML = playerContainerHTML;

        // Attach event listeners to view details and remove player buttons
        const viewDetailsButtons = document.querySelectorAll('.view-details');
        const removePlayerButtons = document.querySelectorAll('.remove-player');

        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', () => {
                const playerId = button.dataset.id;
                fetchSinglePlayer(playerId)
                    .then((player) => {
                        console.log(player)
                        // Display player details in an alert for simplicity
                        alert(`Player Details:
                        Name: ${player.name}
                        Breed: ${player.breed}
                        Status: ${player.status}
                        Created At: ${player.createdAt}
                        Updated At: ${player.updatedAt}
                        Team ID: ${player.teamId}
                        Cohort ID: ${player.cohortId}
                        Team: ${player.team}`);
                    })
                    .catch((err) => {
                        console.error('Error fetching player details:', err);
                    });
            });
        });

        removePlayerButtons.forEach(button => {
            button.addEventListener('click', () => {
                const playerId = button.dataset.id;
                removePlayer(playerId)
                    .then(() => {
                        // Re-render the roster after removing the player
                        init();
                    })
                    .catch((err) => {
                        console.error('Error removing player:', err);
                    });
            });
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }
};



/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
        newPlayerFormContainer.innerHTML = `
            <form id="new-player-form">
                <input type="text" name="name" placeholder="Name" required>
                <input type="text" name="breed" placeholder="Breed" required>
                <select name="status" required>
                    <option value="bench">Bench</option>
                    <option value="field">Field</option>
                </select>
                <input type="url" name="imageUrl" placeholder="Image URL" required>
                <button type="submit">Add Player</button>
            </form>
        `;

        const newPlayerForm = document.getElementById('new-player-form');

        newPlayerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = event.target.elements.name.value;
            const breed = event.target.elements.breed.value;
            const status = event.target.elements.status.value;
            const imageUrl = event.target.elements.imageUrl.value;

            try {
                await addNewPlayer({ name, breed, status, imageUrl });
                // Re-render the roster after adding the player
                init();
                event.target.reset(); // Clear the form inputs
            } catch (err) {
                console.error('Error adding player:', err);
            }
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
};



const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);

    renderNewPlayerForm();
}

init();