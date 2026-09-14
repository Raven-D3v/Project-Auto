const form = document.getElementById("quoteForm");
const successMessage = document.getElementById("successMessage");
const newQuoteButton = document.getElementById("newQuoteButton");
const submitButton = document.getElementById("submitButton");

// ------------------------------------
// N8N WEBHOOK
// ------------------------------------

//Test = https://n8n-prraven.onrender.com/webhook-test/cleanquote
//Prod = https://n8n-prraven.onrender.com/webhook/cleanquote

const N8N_WEBHOOK_URL =
    "https://n8n-prraven.onrender.com/webhook-test/395ecbad-e9c2-4b64-9480-03f4158801ba";


form.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Bootstrap validation
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    form.classList.add("was-validated");

    // Disable button while processing
    submitButton.disabled = true;
    submitButton.innerHTML = "Processing...";


    // Collect selected add-ons
    const selectedAddons = Array.from(
        document.querySelectorAll('input[name="addons"]:checked')
    ).map(input => input.value);


    // Create structured quote request
    const quoteData = {
        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        cleaningType: document.getElementById("cleaningType").value,

        bedrooms: Number(
            document.getElementById("bedrooms").value
        ),

        bathrooms: Number(
            document.getElementById("bathrooms").value
        ),

        squareFeet: Number(
            document.getElementById("squareFeet").value
        ),

        addons: selectedAddons,

        submittedAt: new Date().toISOString()
    };


    // ------------------------------------
    // SEND DATA TO N8N
    // ------------------------------------

    try {

        console.log("Sending Quote Request:", quoteData);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(quoteData)
        });


        // Check if n8n accepted the request
        if (!response.ok) {
            throw new Error(
                `Webhook request failed: ${response.status}`
            );
        }


        // ------------------------------------
        // SUCCESS
        // ------------------------------------

        console.log("Quote successfully sent to n8n.");

        form.classList.add("d-none");
        successMessage.classList.remove("d-none");


    } catch (error) {

        // ------------------------------------
        // ERROR
        // ------------------------------------

        console.error("Error sending quote:", error);

        alert(
            "Sorry, we couldn't process your request right now. Please try again."
        );

        submitButton.disabled = false;
        submitButton.innerHTML = "Get My Estimate";

    }

});


newQuoteButton.addEventListener("click", function () {

    form.reset();

    form.classList.remove("was-validated");

    form.classList.remove("d-none");

    successMessage.classList.add("d-none");

    submitButton.disabled = false;

    submitButton.innerHTML = "Get My Estimate";

});
