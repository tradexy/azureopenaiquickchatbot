// Initialize an empty array to hold the conversation history
let conversationHistory = [];

// Function to extract citation information based on docIndex
function getCitation(docIndex, citations) {
    // Check if citations is defined and has the expected length
    if (!citations || citations.length < docIndex) {
        console.error('Citations array is undefined or does not have the expected length.');
        return '';
    }
    // Assuming citation information is in the content field
    return citations[docIndex - 1].content;
}

// Modified function to convert [docX] references to hyperlinks
function convertDocReferencesToLinks(content, citations) {
    return content.replace(/\[doc(\d+)\]/g, (match, docIndex) => {
        let citationInfo = getCitation(docIndex, citations);
        // Modify the return statement to include a data-citation attribute
        return `<a href="#" data-citation="${citationInfo}" onclick="updateTopSection(event)">${match}</a>`;
    });
}

// Modified function to update the content of #hello-world-placeholder
function updateTopSection(event) {
    event.preventDefault();
    const citationInfo = event.currentTarget.getAttribute('data-citation');
    const placeholder = document.getElementById('hello-world-placeholder');
    placeholder.textContent = citationInfo;
}

// New function to extract citations array from the nested structure
function extractCitations(data) {
    try {
        return JSON.parse(data.choices[0].message.context.messages[0].content).citations;
    } catch (error) {
        console.error('Error extracting citations:', error);
        return [];
    }
}

// Helper function to add a message to the conversation
function addMessageToConversation(role, content) {
    const conversationDiv = document.getElementById('conversation');
    const messageDiv = document.createElement('div');
    messageDiv.className = role;
    messageDiv.innerHTML = content;  // Use innerHTML to render hyperlinks
    conversationDiv.appendChild(messageDiv);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;  // Scroll to the bottom
    
    // Update the conversation history
    conversationHistory.push({ role: role, content: content });
}

// New function to handle user questions
async function askQuestion() {
    const userInputField = document.getElementById('user-input');
    const userQuestion = userInputField.value.trim();
    if (!userQuestion) return;  // Ignore empty questions

    addMessageToConversation('user', userQuestion);  // Add user's question to the conversation
    userInputField.value = '';  // Clear the input field

    const requestData = {
        temperature: 0,
        max_tokens: 4000,
        top_p: 1.0,
        dataSources: [
            {
                type: 'AzureCognitiveSearch',
                parameters: {
                    endpoint: 'https://searchser231025uks.search.windows.net',
                    key: 'sBV5aaYjHGwdxo3ZHZpTdPsqdI4FFaNFRDPAIV1DemAzSeDql1Eo',
                    indexName: 'index432231025uks'
                }
            }
        ],
        messages: conversationHistory.concat([{ role: 'user', content: userQuestion }])
    };

    try {
        const apiUrl = 'https://uksouth.api.cognitive.microsoft.com/openai/deployments/t4deploy231025uks/extensions/chat/completions?api-version=2023-10-01-preview';
        const apiKey = '7f0065f45a2e471c93adb3fd19c3e83e';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(requestData)
        });
        const data = await response.json();

        // Extract citation information
        let citations = extractCitations(data);
        
        // Convert [docX] references to hyperlinks
        let contentWithLinks = convertDocReferencesToLinks(data.choices[0].message.content, citations);

        addMessageToConversation('assistant', contentWithLinks);  // Add assistant's response to the conversation

    } catch (error) {
        console.error('Error:', error);
    }
}
