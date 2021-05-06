var editInputs = document.querySelectorAll(".edit-input");
var editForms = document.querySelectorAll(".edit-form");
var faqForm = document.querySelector("#faqForm");

editInputs.forEach(function(input){
	input.addEventListener("click", function(){
		var formId = input.getAttribute("data-original");
		findForm(formId);
	});
});

function findForm(formId){
	console.log(editForms.length);
	editForms.forEach(function(form){
		if (form.id == formId){
			form.classList.toggle("d-none");
		}
	});
}

function showForm(){
	faqForm.classList.remove("d-none");
}