var total = document.querySelector("#totalPrice");
var totalPrice = 0;
var itemsInCart = document.querySelector("#itemsInCart1");
updateCartNumber();

itemsInCart.textContent = localStorage.length;

for(var i = 0; i < localStorage.length; i++){
	
  var product = JSON.parse(localStorage.getItem(localStorage.key(i)));
  var productId = localStorage.key(i);
  var productName = product.name;
  var productSrc = product.src;
  var productPrice = product.price;
  var productQty = product.qty;
  var productSize = product.size;
  var productBorder = product.border;
  
  productPrice = parseFloat(productPrice);
  productQty = parseFloat(productQty);
  totalPrice += productPrice*productQty;
	
	const markup = `
	 <div class="row my-2">
		<div class="col-md-6">
		  <div  class="rounded">
			<div style="width: 18rem;">
			  <img class="img-fluid w-100 rounded shadow-sm" id="productImageSrc" src="${productSrc}" alt="...">
			</div>
		  </div>
		</div>
		<div class="col-md-6">
		  <div>
			<h5 id="productName" ><strong>${productName}</strong></h5>
			<p class="mb-3 text-muted text-uppercase small"><strong>size :</strong> ${productSize}</p>
			<p class="mb-2 text-muted text-uppercase small"><strong>type :</strong> Lustre paper with wooden frame</p>
			<p class="mb-3 text-muted text-uppercase small"><strong>border :</strong> ${productBorder}</p>
			<p class="mb-3 text-muted text-uppercase small"><strong>price :</strong> ${productPrice}</p>
		  </div>
		  <div class="input-group mb-4">
			<label><strong>Qty &nbsp;</strong></label>
			<input id="qty" type="number" class="qty quantity text-center shadow-sm" placeholder="" aria-label="" aria-describedby="" value=${productQty} min=1 data-original=${productId}>
		  </div>
		  <button class="btn btn-sm btn-outline-danger shadow-sm dangerButton" data-original=${productId}>Remove From Cart</button>
		</div>
	  </div>
	  <hr>
	`;
	document.getElementById("product-container").innerHTML += markup;
	
	document.getElementById("tableRows").innerHTML += table(i);
}

	
// ============= RENDER TABLE =================== //

function table(i){
	const tableRow = `
	<tr>
	  <th scope="row">${i+1}</th>
	  <td> ${productName}</td>
	  <td>&nbsp; ${productQty}</td>
	  <td> ${productPrice}</td>
	  <td> ${(productPrice * productQty).toFixed(2)}</td>
	</tr>
	`;
	  return tableRow
}
	
// ========= LISTEN FOR CHANGE IN QTY INPUT ========= //
//var qtyInputButton    = document.querySelectorAll(".qty");
//qtyInputButton.addEventListener("change", quantityChanged);

function quantityChanged(event){
	var input = event.target
	if(isNaN(input.value) || input.value <= 0){// error
		input.value = 1;
	}
	var inputValue = input.value;
	var productID = this.getAttribute("data-original");
	for(var i = 0; i < localStorage.length; i++){
		if(productID == localStorage.key(i)){
			var product = JSON.parse(localStorage.getItem(localStorage.key(i)));
			var item = {
				name: product.name,
				src: product.src,
				price: product.price,
				qty: input.value,
				size:product.size,
				border: product.border
			}
			localStorage.setItem(productID, JSON.stringify(item));
			location.reload();
		}
	}
}

// DELETE ITEM FROM CART
function removeItem(productID){
	localStorage.removeItem(productID);
	location.reload();
}

function pollDOM () {
  var deleteButton = document.querySelectorAll((".dangerButton"));
  var qtyInputButton = document.querySelectorAll(".qty");
  if (qtyInputButton.length) {
	  qtyInputButton.forEach(function(button){
		  button.addEventListener("change", quantityChanged)
	  });
	  deleteButton.forEach(function(button){
		  var productID = button.getAttribute("data-original");
		  button.addEventListener("click", function(){
			  removeItem(productID);
			  updateCartNumber();
		  });
	  });
  } else {
    setTimeout(pollDOM, 300); // try again in 300 milliseconds
  }
}

pollDOM();

total.textContent = "$"+totalPrice.toFixed(2);

// UPDATE CART NUMBER
function updateCartNumber(){
	var itemsInCart = document.getElementById("itemsInCart");
	itemsInCart.innerHTML = localStorage.length;
}