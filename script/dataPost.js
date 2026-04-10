// --- CONFIGURATION ---
// Paste the URL you got after deploying your Google Apps Script
const scriptURL = 'https://script.google.com/macros/s/AKfycbyU-7mlxZr187kpcjupR6PdcDQwJGhJN4QYQ98hNOkkY4QTz2WOCRZctaDjWH68KbPq/exec';

// This MUST match the SECRET_TOKEN variable in your Google Apps Script
const SECRET_TOKEN = "__SECRET_TOKEN_PLACEHOLDER__";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('form-status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the default page reload

        // 1. Update UI to show loading state
        submitBtn.disabled = true;
        submitBtn.innerText = "Sending securely...";
        
        // Reset the status message text and styling
        statusMessage.innerText = "";
        statusMessage.style.color = ""; 
        statusMessage.style.marginTop = "";

        // 2. Gather form data
        const formData = new FormData(form);
        
        // 3. Inject the Secret Token for API scraping protection
        formData.append('secret_token', SECRET_TOKEN);

        try {
            // 4. Send the data to Google Apps Script
            const response = await fetch(scriptURL, { 
                method: 'POST', 
                body: formData 
            });
            
            const result = await response.json();

            // 5. Handle the backend response with standard inline styles
            if (result.result === "success") {
                statusMessage.innerText = "Success! Your message has been sent.";
                statusMessage.style.color = "#28a745"; // A nice green color
                statusMessage.style.marginTop = "15px";
                form.reset(); // Clear the form
            } else {
                // This will trigger if the honeypot is filled or token is wrong
                console.error("Backend rejection:", result.error);
                statusMessage.innerText = "Message blocked: " + result.error;
                statusMessage.style.color = "#dc3545"; // A visible red color
                statusMessage.style.marginTop = "15px";
            }
            
        } catch (error) {
            console.error("Fetch error:", error);
            statusMessage.innerText = "A network error occurred. Please try again.";
            statusMessage.style.color = "#dc3545"; // Red color for error
            statusMessage.style.marginTop = "15px";
        } finally {
            // 6. Restore the button state
            submitBtn.disabled = false;
            submitBtn.innerText = "Send Message";
        }
    });
});
