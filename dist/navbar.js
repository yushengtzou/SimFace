// Navbar 的相關功能
export function navbar() {
    // Select the 'a' element using the id property
    const uploadLink = document.getElementById("uploadLink");
    // Add an event listener to the 'uploadLink' element
    // This listens for a 'click' event on the link
    uploadLink.addEventListener('click', function (event) {
        // Prevent the default action of the link (which is navigating to '#')
        event.preventDefault();
        console.log("Upload button being click.");
        // Select the file input element using its id property
        const fileInput = document.getElementById('fileInput');
        // Programmatically trigger a click event on the file input element
        // This will open the file picker dialog
        fileInput.click();
    });
}
