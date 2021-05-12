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
	var borderBtns 		= document.querySelectorAll(".borderBtn");
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


	// ========== LISTEN FOR BORDER BUTTON SELECTION ============== 
	for (var i = 0; i < borderBtns.length; i++){
		borderBtns[i].addEventListener("click", function(){
			borderBtns[0].classList.remove("selected");
			borderBtns[1].classList.remove("selected");
			this.classList.add("selected");
		});
	};

	// ======== ADD TO CART FUNCTIONALITY ======== 

	buttons.forEach(function(button){
		button.addEventListener("click", function(){
			if(button.id == "addToCartButton"){
				var qtyValue = parseInt(qtyInputButton.value);
				var selectedSize = document.getElementsByClassName("sizeBtn btn selected")[0].lastChild.data;
				var selectedBorder = document.getElementsByClassName("borderBtn btn selected")[0].lastChild.data;
				var item = {
					mediaId: photoId,
					qty: qtyValue,
					size:selectedSize,
					border: selectedBorder
				}
				cartItems.push(item);
				if(localStorage.length){
					storageCartItems = JSON.parse(localStorage.getItem("cart"));
					console.log("from the JS: ",storageCartItems);
					for(var i = 0; i < storageCartItems.length; i++){
						console.log(storageCartItems[i]);
						if(storageCartItems[i].mediaId !== item.mediaId){
							cartItems.push(storageCartItems[i]);
						}
					}
					// cartItems.push(localStorage.getItem("cart"));
				}
				localStorage.clear();
				localStorage.setItem("cart", JSON.stringify(cartItems));
				cartItems = [];
				updateCartNumber();
				success();
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