/* =========================================================
   CONFIGURATION
========================================================= */

/*
Replace this with your n8n webhook URL.

Development:
https://n8n-prraven.onrender.com/webhook-test/99c9a39d-cbe0-4676-9324-33d8bfc441ac

Production:
https://n8n-prraven.onrender.com/webhook/99c9a39d-cbe0-4676-9324-33d8bfc441ac
*/

const N8N_WEBHOOK_URL =
    "https://n8n-prraven.onrender.com/webhook/99c9a39d-cbe0-4676-9324-33d8bfc441ac";


/* =========================================================
   ELEMENT REFERENCES
========================================================= */

const workstationSelect =
    document.getElementById("workstation");

const panelSelect =
    document.getElementById("panelCode");

const checkButton =
    document.getElementById("checkButton");

const askButton =
    document.getElementById("askButton");

const questionInput =
    document.getElementById("questionInput");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");


/* =========================================================
   EVENT LISTENERS
========================================================= */

checkButton.addEventListener(
    "click",
    checkPanel
);

askButton.addEventListener(
    "click",
    askAI
);

questionInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            askAI();
        }

    }
);


/* =========================================================
   CHECK PANEL
========================================================= */

async function checkPanel() {

    const panelCode =
        panelSelect.value;

    const workstationId =
        workstationSelect.value;

    clearError();

    setLoading(true);

    addTrace(
        "Starting panel check...",
        "info"
    );


    const payload = {

        action: "scan",

        panel_code: panelCode,

        workstation_id: workstationId,

        message:
            `Can panel ${panelCode} be processed at workstation ${workstationId}?`

    };


    try {

        const response =
            await callAgent(payload);


        displayAgentResponse(response);


        addHistory({

            event_type: "Panel Scan",

            panel_code: panelCode,

            workstation_id: workstationId,

            status:
                getResponseStatus(response)

        });

    }

    catch (error) {

        console.error(error);

        showError(
            "Unable to contact the AI Agent. Check your n8n webhook URL and make sure the workflow is active."
        );

        addTrace(
            "AI Agent request failed",
            "failure"
        );

    }

    finally {

        setLoading(false);

    }

}


/* =========================================================
   ASK AI
========================================================= */

async function askAI() {

    const question =
        questionInput.value.trim();

    if (!question) {
        return;
    }


    const panelCode =
        panelSelect.value;

    const workstationId =
        workstationSelect.value;


    clearError();

    setLoading(true);

    askButton.disabled = true;


    const answerBox =
        document.getElementById("answerBox");


    answerBox.style.display =
        "block";

    answerBox.textContent =
        "AI Agent is thinking...";


    const payload = {

        action: "question",

        panel_code: panelCode,

        workstation_id: workstationId,

        message: question

    };


    try {

        const response =
            await callAgent(payload);


        displayQuestionResponse(response);


        addHistory({

            event_type: "AI Question",

            panel_code: panelCode,

            workstation_id: workstationId,

            status: "Completed"

        });

    }

    catch (error) {

        console.error(error);

        answerBox.textContent =
            "Unable to contact the AI Agent.";

        showError(
            "The AI Agent request failed."
        );

    }

    finally {

        setLoading(false);

        askButton.disabled = false;

    }

}


/* =========================================================
   CALL N8N
========================================================= */

async function callAgent(payload) {

    if (
        !N8N_WEBHOOK_URL ||
        N8N_WEBHOOK_URL === "YOUR_N8N_WEBHOOK_URL_HERE"
    ) {

        throw new Error(
            "N8N webhook URL has not been configured."
        );

    }


    const response =
        await fetch(
            N8N_WEBHOOK_URL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(payload)

            }
        );


    if (!response.ok) {

        throw new Error(
            `HTTP error ${response.status}`
        );

    }


    return await response.json();

}


/* =========================================================
   DISPLAY AGENT RESPONSE
========================================================= */

function displayAgentResponse(data) {

    const result =
        extractResult(data);


    /* PANEL */

    if (result.panel) {

        document.getElementById(
            "infoPanelCode"
        ).textContent =
            result.panel.panel_code || "—";


        document.getElementById(
            "infoCabinetId"
        ).textContent =
            result.panel.cabinet_id || "—";


        document.getElementById(
            "infoPanelName"
        ).textContent =
            result.panel.panel_name || "—";


        document.getElementById(
            "infoDimensions"
        ).textContent =
            formatDimensions(result.panel);


        document.getElementById(
            "infoMaterial"
        ).textContent =
            result.panel.material || "—";


        document.getElementById(
            "infoOperation"
        ).textContent =
            result.panel.required_operation || "—";

    }


    /* STATUS */

    const status =
        result.status ||
        "Information Available";


    document.getElementById(
        "statusValue"
    ).textContent =
        status;


    updateStatusStyle(status);


    /* DECISION */

    document.getElementById(
        "decisionText"
    ).textContent =
        result.decision ||
        result.output ||
        "No decision returned.";


    /* NEXT STEP */

    document.getElementById(
        "nextStep"
    ).textContent =
        result.next_step ||
        "Follow the approved SOP.";


    /* INSTRUCTIONS */

    displayInstructions(
        result.instructions
    );


    /* SOURCES */

    displaySources(
        result.sources
    );


    /* TRACE */

    displayTrace(
        result.trace
    );

}


/* =========================================================
   DISPLAY QUESTION RESPONSE
========================================================= */

function displayQuestionResponse(data) {

    const result =
        extractResult(data);


    const answer =
        result.output ||
        result.answer ||
        result.response ||
        result.decision ||
        JSON.stringify(data, null, 2);


    const answerBox =
        document.getElementById("answerBox");


    answerBox.style.display =
        "block";


    answerBox.textContent =
        answer;


    displaySources(
        result.sources
    );


    displayTrace(
        result.trace
    );

}


/* =========================================================
   EXTRACT RESULT
========================================================= */

function extractResult(data) {

    if (
        data &&
        typeof data.result === "object"
    ) {

        return data.result;

    }


    return data || {};

}


/* =========================================================
   FORMAT DIMENSIONS
========================================================= */

function formatDimensions(panel) {

    if (!panel) {
        return "—";
    }


    const length =
        panel.length_mm;

    const width =
        panel.width_mm;

    const thickness =
        panel.thickness_mm;


    if (
        length &&
        width &&
        thickness
    ) {

        return `${length} × ${width} × ${thickness} mm`;

    }


    return "—";

}


/* =========================================================
   DISPLAY INSTRUCTIONS
========================================================= */

function displayInstructions(instructions) {

    const container =
        document.getElementById(
            "instructions"
        );


    if (!instructions) {

        container.innerHTML =
            "No instructions loaded.";

        return;

    }


    if (Array.isArray(instructions)) {

        const list =
            document.createElement("ol");


        instructions.forEach(
            instruction => {

                const li =
                    document.createElement("li");


                li.textContent =
                    instruction;


                list.appendChild(li);

            }
        );


        container.innerHTML = "";

        container.appendChild(list);

        return;

    }


    container.textContent =
        instructions;

}


/* =========================================================
   DISPLAY SOURCES
========================================================= */

function displaySources(sources) {

    const container =
        document.querySelector(
            ".sources"
        );


    container.innerHTML = "";


    if (
        !sources ||
        sources.length === 0
    ) {

        const tag =
            document.createElement("span");


        tag.className =
            "source-tag";


        tag.textContent =
            "Source: Agent Response";


        container.appendChild(tag);

        return;

    }


    sources.forEach(source => {

        const tag =
            document.createElement("span");


        tag.className =
            "source-tag";


        tag.textContent =
            `Source: ${source}`;


        container.appendChild(tag);

    });

}


/* =========================================================
   TRACE
========================================================= */

function displayTrace(trace) {

    const container =
        document.getElementById(
            "trace"
        );


    container.innerHTML = "";


    if (
        !trace ||
        trace.length === 0
    ) {

        const item =
            document.createElement("div");


        item.className =
            "trace-item";


        item.textContent =
            "Execution completed. Detailed trace was not returned.";


        container.appendChild(item);

        return;

    }


    trace.forEach(step => {

        const item =
            document.createElement("div");


        item.className =
            "trace-item";


        const success =
            step.status !== "failure";


        item.innerHTML = `

            <div class="${
                success
                    ? "trace-success"
                    : "trace-failure"
            }">

                ${success ? "✓" : "✕"}

                <span class="trace-tool">
                    ${escapeHtml(
                        step.tool ||
                        step.name ||
                        "Agent step"
                    )}
                </span>

            </div>

            <div>
                ${
                    escapeHtml(
                        step.input ||
                        ""
                    )
                }
            </div>

            <div class="trace-source">

                ${
                    escapeHtml(
                        step.source ||
                        ""
                    )
                }

            </div>

        `;


        container.appendChild(item);

    });

}


/* =========================================================
   ADD TRACE
========================================================= */

function addTrace(message, type = "info") {

    const container =
        document.getElementById(
            "trace"
        );


    const item =
        document.createElement("div");


    item.className =
        "trace-item";


    if (type === "failure") {

        item.classList.add(
            "trace-failure"
        );

    }

    else {

        item.classList.add(
            "trace-success"
        );

    }


    item.textContent =
        type === "failure"
            ? `✕ ${message}`
            : `✓ ${message}`;


    container.prepend(item);

}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(event) {

    const container =
        document.getElementById(
            "history"
        );


    const empty =
        container.querySelector(
            ".history-empty"
        );


    if (empty) {

        container.innerHTML = "";

    }


    const table =
        container.querySelector(
            "table"
        );


    let historyTable;


    if (!table) {

        historyTable =
            document.createElement("table");


        historyTable.className =
            "history-table";


        historyTable.innerHTML = `

            <thead>

                <tr>

                    <th>Time</th>

                    <th>Event</th>

                    <th>Panel</th>

                    <th>Workstation</th>

                    <th>Status</th>

                </tr>

            </thead>

            <tbody></tbody>

        `;


        container.appendChild(
            historyTable
        );

    }

    else {

        historyTable =
            table;

    }


    const tbody =
        historyTable.querySelector(
            "tbody"
        );


    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td>
            ${new Date().toLocaleTimeString()}
        </td>

        <td>
            ${escapeHtml(event.event_type)}
        </td>

        <td>
            ${escapeHtml(event.panel_code)}
        </td>

        <td>
            ${escapeHtml(event.workstation_id)}
        </td>

        <td>
            ${escapeHtml(event.status)}
        </td>

    `;


    tbody.prepend(row);

}


/* =========================================================
   RESPONSE STATUS
========================================================= */

function getResponseStatus(data) {

    const result =
        extractResult(data);


    return (
        result.status ||
        "Completed"
    );

}


/* =========================================================
   STATUS STYLE
========================================================= */

function updateStatusStyle(status) {

    const box =
        document.getElementById(
            "statusBox"
        );


    box.className =
        "status-box";


    const text =
        status.toLowerCase();


    if (
        text.includes("correct") ||
        text.includes("available") ||
        text.includes("approved")
    ) {

        box.classList.add(
            "success"
        );

    }

    else if (
        text.includes("wrong") ||
        text.includes("not found") ||
        text.includes("error") ||
        text.includes("unavailable")
    ) {

        box.classList.add(
            "error"
        );

    }

    else if (
        text.includes("escalat") ||
        text.includes("warning")
    ) {

        box.classList.add(
            "warning"
        );

    }

    else {

        box.classList.add(
            "info"
        );

    }

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(isLoading) {

    loading.style.display =
        isLoading
            ? "block"
            : "none";


    checkButton.disabled =
        isLoading;

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    errorMessage.textContent =
        message;


    errorMessage.style.display =
        "block";

}


function clearError() {

    errorMessage.textContent =
        "";


    errorMessage.style.display =
        "none";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
