const form = document.getElementById("quoteForm");
const successMessage = document.getElementById("successMessage");
const newQuoteButton = document.getElementById("newQuoteButton");
const submitButton = document.getElementById("submitButton");

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
    // TEMPORARY DEMO
    // ------------------------------------

    console.log("Quote Request:", quoteData);


    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));


    // Show success message
    form.classList.add("d-none");
    successMessage.classList.remove("d-none");

});


newQuoteButton.addEventListener("click", function () {

    form.reset();

    form.classList.remove("was-validated");

    form.classList.remove("d-none");

    successMessage.classList.add("d-none");

    submitButton.disabled = false;

    submitButton.innerHTML = "Get My Estimate";

});
