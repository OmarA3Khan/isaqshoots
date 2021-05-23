window.addEventListener("DOMContentLoaded", function () {
	
	updateCartNumber();
	var buttons         = document.querySelectorAll(".btn");
	var photo           = document.querySelector("#product");
	var qtyInputButton  = document.querySelector("#qty");
	var figCaption 		= document.querySelector("#figCaption");
	var photoId 		= figCaption.getAttribute("data-original");
	var photoName		= photo.getAttribute("data-original");
	var photoSrc 		= photo.src;
	var photoPrice   	= photo.alt;
	var qtyValue 		= parseInt(qtyInputButton.value);
	var sizeBtns 		= document.querySelectorAll(".sizeBtn");
	var borderBtns 		= document.querySelectorAll(".typeBtn");
	var frameColorDiv	= document.querySelector("#frameColor");
	var radioBtns 		= document.querySelectorAll(".chooseColor")
	var cartItems 		= [];

	// ========== LISTEN FOR SIZE BUTTON SELECTION ============== 
	for (var i = 0; i < sizeBtns.length; i++){
		sizeBtns[i].addEventListener("click", function(){
			sizeBtns[0].classList.remove("selected");
			sizeBtns[1].classList.remove("selected");
			sizeBtns[2].classList.remove("selected");
			sizeBtns[3].classList.remove("selected");
			sizeBtns[4].classList.remove("selected");
			sizeBtns[5].classList.remove("selected");
			sizeBtns[6].classList.remove("selected");
			this.classList.add("selected");
			var selectedSize = this;
		});
	};

	var status = document.getElementById("status");
	function success() {
		status.classList.add("success");
		status.innerHTML = "added to Cart!";
		setTimeout(function(){
			status.classList.remove("success");
			status.innerHTML = "";
		}, 6000)
	}

	function error() {
		status.classList.add("error");
		status.innerHTML = "Oops! There was a problem.";
	}


	// ========== LISTEN FOR TYPE BUTTON SELECTION ============== 
	for (var i = 0; i < borderBtns.length; i++){
		borderBtns[i].addEventListener("click", function(){
			borderBtns[0].classList.remove("selected");
			borderBtns[1].classList.remove("selected");
			this.classList.add("selected");
			if(this.innerHTML == 'frame'){
				frameColorDiv.classList.remove("d-none");
			}else{
				frameColorDiv.classList.add("d-none");
			}
		});
	};
	
	// ================= CHOOSE FRAME COLOR ==================
	for (var i = 0; i < radioBtns.length; i++){
		radioBtns[i].addEventListener("click", function(){
			radioBtns[0].classList.remove("selected");
			radioBtns[1].classList.remove("selected");
			this.classList.add("selected");
			if(this.id == "colorBlack"){
				console.log("black");
			}else{
				console.log("brown");
			}
		});
	};

	// ======== ADD TO CART FUNCTIONALITY ======== 
	
	function addToCart(){
		var qtyValue = parseInt(qtyInputButton.value);
		var selectedSize = document.getElementsByClassName("sizeBtn btn selected")[0].innerHTML;
		var selectedType = document.getElementsByClassName("typeBtn btn selected")[0].innerHTML;
		if(selectedType == 'frame'){
			if(document.getElementsByClassName("chooseColor selected")[0].id == "colorBlack"){
				var frameColor = 'Black';
			}else{
				var frameColor = 'Brown';
			}
		}
		var item = {
			mediaId: photoId,
			qty: qtyValue,
			size:selectedSize,
			type: selectedType,
			color: frameColor
		}
		cartItems.push(item);
		if(localStorage.length){
			var storageCartItems = JSON.parse(localStorage.getItem("cart"));
			for(var i = 0; i < storageCartItems.length; i++){
				if(storageCartItems[i].mediaId !== item.mediaId){
					cartItems.push(storageCartItems[i]);
				}
			}
		}
		localStorage.clear();
		localStorage.setItem("cart", JSON.stringify(cartItems));
		cartItems = [];
		updateCartNumber();
		success();
	}

	buttons.forEach(function(button){
		button.addEventListener("click", function(){
			if(button.id == "addToCartButton"){
				addToCart();
			}else if(button.id == "buyNowButton"){
				addToCart();
				window.location.href = "/cart";
			}
		});
	});

	// ========================================  ==================//

	// ========= LISTEN FOR CHANGE IN QTY INPUT ========= //

	qtyInputButton.addEventListener("change", quantityChanged);

	function quantityChanged(event){
		var input = event.target
		if(isNaN(input.value) || input.value <= 0){
			input.value = 1;
		}
	}


	// UPDATE CART NUMBER
	function updateCartNumber(){
		var itemsInCart = document.getElementById("itemsInCart");
		if(localStorage.length){
			itemsInCart.innerHTML = JSON.parse(localStorage.getItem("cart")).length;	
		}
	}
});