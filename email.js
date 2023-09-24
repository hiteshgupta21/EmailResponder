const API_KEY = 'Enter your API key';
const submitButton = document.querySelector('#submit');
const outPutElement = document.querySelector('#output');
const inputElement = document.querySelector('input');
const historyElement = document.querySelector('.history');
const buttonElement = document.querySelector('button');
const copyReplyButton = document.querySelector('#copyReplyButton'); // Add this line

const maxHistoryItemLength = 50;

async function getMessage() {
    const initialMessage = "Summarise the following for me in bullet points";

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: initialMessage },
                { role: "user", content: inputElement.value }
            ]
        })
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            // Display the reply from the API
            const apiReply = data.choices[0].message.content;
            outPutElement.textContent = apiReply;

            // Allow the user to copy the API reply
            
            if (data.choices[0].message.content && inputElement.value) {
                // Truncate the input text to a small portion
                const smallText = inputElement.value.substring(0, maxHistoryItemLength);

                const pElement = document.createElement('p');
                pElement.textContent = smallText;
                pElement.addEventListener('click', () => changeInput(inputElement.value));

                historyElement.append(pElement);

                // Delay showing the prompt to reply to the email
                setTimeout(async () => {
                    const replyConfirmed = confirm('Do you want to reply to the email?');
                    if (replyConfirmed) {
                        // Include the original user input in the reply message
                        const replyMessage = `Write an appropriate reply for this email for me:\n${inputElement.value}`;
                        const replyOptions = {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${API_KEY}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                model: "gpt-3.5-turbo",
                                messages: [
                                    { role: "system", content: replyMessage }, // Requesting a reply
                                ]
                            })
                        };
                        const replyResponse = await fetch('https://api.openai.com/v1/chat/completions', replyOptions);
                        const replyData = await replyResponse.json();

                        if (replyData.choices && replyData.choices.length > 0) {
                            // Display the reply from the API
                            const apiReply = replyData.choices[0].message.content;
                            alert(`API Reply: ${apiReply}`);
                            copyReplyButton.addEventListener('click', () => {
                                const tempTextArea = document.createElement("textarea");
                                tempTextArea.value = apiReply;
                                document.body.appendChild(tempTextArea);
                                tempTextArea.select();
                                document.execCommand("copy");
                                document.body.removeChild(tempTextArea);
                                alert('API Reply copied to clipboard!');
                            });
                
                        } else {
                            console.error('No response content in the API response for reply.');
                        }
                    }
                }, 0); // The delay here is set to 0 milliseconds to execute after the current code block.
            }
        } else {
            console.error('No response content in the API response.');
        }
    } catch (error) {
        console.error(error);
    }
}

function changeInput(value) {
    inputElement.value = value;
}

function clearInput() {
    inputElement.value = '';
}

submitButton.addEventListener('click', getMessage);
buttonElement.addEventListener('click', clearInput);
