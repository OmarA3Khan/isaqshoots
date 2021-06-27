// const navLinks = document.querySelector(".nav-links");
// const links = document.querySelectorAll(".nav-links li");
var radioBtns = document.querySelectorAll(".mediaUpload")
var videoUrl = document.querySelector("#videoUrl");
var Image = document.querySelector("#imageUpload");
var videoUrlInput = document.querySelector("#videoUrlInput");

for (var i = 0; i < radioBtns.length; i++){
	radioBtns[i].addEventListener("click", function(){
		radioBtns[0].classList.remove("selected");
		radioBtns[1].classList.remove("selected");
		this.classList.add("selected");
		if(this.id == "Video"){
			videoUrl.classList.remove("d-none");
			Image.classList.remove("d-none");
		}else{
			videoUrl.classList.add("d-none");
			Image.classList.add("d-none");
			console.log(videoUrlInput);
			videoUrlInput.value = null;
		}
	});
};


// UPDATE CART NUMBER
function updateCartNumber(){
	var itemsInCart = document.getElementById("itemsInCart");
	if(localStorage.length){
		itemsInCart.innerHTML = JSON.parse(localStorage.getItem("cart")).length;	
	}
}

updateCartNumber();