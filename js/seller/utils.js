// Utility function to display SweetAlert forms
export function showForm(title, html, callback) {
  Swal.fire({
    title,
    html,
    showCancelButton: true,
    confirmButtonText: "Save",
    preConfirm: () => callback(),
  });
}

// Utility function to handle errors
export function handleError(error) {
  console.error(error);
  Swal.fire("Error", "Something went wrong. Please try again.", "error");
}
