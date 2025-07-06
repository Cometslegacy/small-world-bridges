const selectedCards = [];
let allCards = [];  // Will store full card data

fetch('ygoprodeck.json')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load CardInfo.json');
        return res.json();
    })
    .then(data => {
        allCards = data.data; 
        const mainDeckCards = allCards.filter(isMainDeckMonster)
        const cardNames = mainDeckCards.map(card => card.name);

        const input = document.getElementById("card-input");
        const awesomplete = new Awesomplete(input, { list: cardNames });

        input.addEventListener("awesomplete-selectcomplete", (evt) => {
            const cardName = evt.text.value;
            if (!selectedCards.includes(cardName)) {
                selectedCards.push(cardName);
                input.value = "";
                updateNetwork();
            }
        });
    })
    .catch(console.error);

function isMainDeckMonster(card) {
    // Check if it's a monster (not spell/trap)
    if (!card.type.includes("Monster")) return false;
    
    // Exclude Extra Deck monster types
    const extraDeckTypes = [
        "Fusion",
        "Synchro",
        "Xyz",
        "Link",
        "Pendulum"
    ];
    
    return !extraDeckTypes.some(type => card.type.includes(type));
}

function updateNetwork() {
    const selectedData = allCards.filter(card => selectedCards.includes(card.name));

    const nodes = new vis.DataSet(selectedData.map(card => ({
        id: card.name,
        //label: card.name,
        shape: 'circularImage',
        image: card.card_images[0].image_url_cropped,
        //hiddenLabel: true
    })));

// ----------------------------------

  
const edges = [];

const CONNECTION_TYPES = {
    ATK: { color: 'red', label: 'Same ATK' },
    DEF: { color: 'blue', label: 'Same DEF' },
    LEVEL: { color: 'green', label: 'Same Level' },
    ATTRIBUTE: { color: 'purple', label: 'Same Attribute' },
    TYPE: { color: 'orange', label: 'Same Type' }
};

const BASE_EDGE = {
    arrows: { from: false, to: false, middle: false },
    width: 10
};

for (let i = 0; i < selectedData.length; i++) {
    for (let j = i + 1; j < selectedData.length; j++) {
        const cardA = selectedData[i];
        const cardB = selectedData[j];
        
        // Track which properties match
        const matchingProperties = [];
        
        // Check each property (using loose equality for number/string cases)
        if (cardA.atk == cardB.atk) matchingProperties.push('ATK');
        if (cardA.def == cardB.def) matchingProperties.push('DEF');
        if (cardA.level == cardB.level) matchingProperties.push('LEVEL');
        if (cardA.attribute == cardB.attribute) matchingProperties.push('ATTRIBUTE');
        if (cardA.race == cardB.race) matchingProperties.push('Race');

        // Only proceed if exactly one property matches
        if (matchingProperties.length === 1) {
            const matchedProperty = matchingProperties[0];
            edges.push({
                ...BASE_EDGE,
                from: cardA.name,
                to: cardB.name,
                color: { color: CONNECTION_TYPES[matchedProperty].color },
                //label: CONNECTION_TYPES[matchedProperty].label
            });
        }
    }
}

// ---------------------------------------

    const options = {
        nodes: { 
                shape: "dot", 
                size: 48,
                font: {
                        color: '#ffffff',
                        size: 24,
                        face: 'Arial'
                },
                labelHighlightBold: false,
                borderWidth: 2,
                color:{
                        border: '#ffffff',
                        background: '#333333'
                }
        },
        edges: {
            arrows: { to: false, from: false, middle: false },
            smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 }
        },
        physics: false,

        interaction: {
            hover: false,
            multiselect: false,
            selectable: false,
            selectConnectedEdges: false
        },

        manipulation: {
            enabled: false
        }
    };

const container = document.getElementById("network");

// Safely destroy previous network instance if any
if (window.network && typeof window.network.destroy === "function") {
    window.network.destroy();
    window.network = null;
}

window.network = new vis.Network(container, { nodes, edges }, options);
}

// ---------------------------------------------------------------------------------------

