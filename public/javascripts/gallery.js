window.addEventListener("DOMContentLoaded", function () {
	const modal = document.querySelector(".myModal");
	const previews = document.querySelectorAll(".gallery img");
	const original = document.querySelector(".full-img");
	const imgText = document.querySelector(".myCaption");
	const modalName = document.querySelector("#modalName");

	updateCartNumber();

	previews.forEach(function(preview){
		preview.addEventListener("click",function(){
			modal.classList.add("open");
			original.classList.add("open");
			//dynamic change of text
			const previewSrc = preview.getAttribute("src");
			original.src = previewSrc;
			const description = preview.getAttribute("data-original");
			const altText = preview.alt;
			modalName.textContent = altText;
		});
	});

	// MODAL FUNCTIONALITY
	modal.addEventListener("click", function(e){
		if(e.target.classList.contains("myModal")){
			modal.classList.remove("open");
			original.classList.remove("open");
		}
	});

});