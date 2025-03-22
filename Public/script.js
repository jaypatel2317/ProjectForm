document.getElementById("generate").addEventListener("click", async function () {
    const studentId = document.getElementById("studentId").value;
    const formType = document.getElementById("formSelection").value;

    console.log(`📌 Sending Request: Student ID = ${studentId}, Form Type = ${formType}`); // ✅ Debugging log

    if (!studentId) {
        alert("❌ Please enter a Student ID.");
        return;
    }

    try {
        const response = await fetch('/fetch-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, formType })
        });

        console.log("📌 Fetch Response:", response); // ✅ Log response

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Received Form Data:", data.filledForm); // ✅ Log received form data

            showPopup(data.filledForm);
        } else {
            console.error("❌ Server Error:", data.error);
            alert(data.error);
        }
    } catch (error) {
        console.error("❌ Fetch Failed:", error);
        alert("❌ Error fetching student data.");
    }
});

// ✅ Function to Show Only the Selected Form in a Pop-up Modal
function showPopup(filledForm) {
    console.log("📌 Injecting Form into Modal..."); // ✅ Debugging log
    document.getElementById("formContainer").innerHTML = filledForm;
    document.getElementById("formModal").style.display = "block";
}

// ✅ Close Modal on Click
document.querySelector(".close").addEventListener("click", function () {
    console.log("📌 Closing Modal..."); // ✅ Debugging log
    document.getElementById("formModal").style.display = "none";
});


document.getElementById("printPdfBtn").addEventListener("click", async function () {
    const formContainer = document.getElementById("formContainer");

    if (!formContainer || formContainer.innerHTML.trim() === "") {
        alert("❌ No form data to print.");
        return;
    }

    try {
        const response = await fetch("/generate-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formHtml: formContainer.innerHTML }),
        });

        if (!response.ok) throw new Error("❌ Failed to generate PDF.");

        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // ✅ Open in a new tab instead of downloading
        window.open(pdfUrl, "_blank");
    } catch (error) {
        alert("❌ Error generating PDF.");
        console.error(error);
    }
});
