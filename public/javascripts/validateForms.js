(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".validated-form");

  // Loop over them and prevent submission
  // from(forms) converts all off the forms to array by slicing them
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        //checkvalidity() is a method
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
