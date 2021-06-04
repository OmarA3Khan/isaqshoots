var total = document.querySelector("#totalPrice");
var totalPrice = 0;
var itemsInCart = document.querySelector("#itemsInCart1");
var updateCartItems = [];

var itemsToSend = [];

var cartItems = JSON.parse(localStorage.getItem("cart"));

itemsInCart.textContent = cartItems.length;

async function renderHTML (){
	for(var i = 0; i < cartItems.length; i++){
	  var productQty = cartItems[i].qty;
	  var productSize = cartItems[i].size;
	  var productType = cartItems[i].type;
	  var productId = cartItems[i].mediaId;
	  if(productType == 'frame'){
		  var productFrameColor = cartItems[i].color;
	  } else{
		  var productFrameColor = 'Frame color not available for Lustre paper'
	  }
	  const product = await axios.get('/media/'+productId)
	  .then(function (response) {
		// handle success
		return response;
	  });
	  var productName = product.data.name;
	  var productSrc = product.data.image;
	  var productPrice = product.data.price;

	  productPrice = parseFloat(productPrice);
	  productQty = parseFloat(productQty);
	  totalPrice += productPrice*productQty;
	
	  var item = {productId:productId, qty:productQty, type: productType, size: productSize, Color: productFrameColor}
	  itemsToSend.push(item);
		
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
				<p class="mb-2 text-muted text-uppercase small"><strong>type :</strong> ${productType}</p>
				<p class="mb-3 text-muted text-uppercase small"><strong>color :</strong> ${productFrameColor}</p>
				<p class="mb-3 text-muted text-uppercase small"><strong>price :</strong> $${productPrice}</p>
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

		document.getElementById("tableRows").innerHTML += table(i,productName,productQty,productPrice);
	}
}

renderHTML();
	
// ============= RENDER TABLE =================== //

function table(i,productName,productQty,productPrice){
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

function quantityChanged(event){
	var input = event.target
	if(isNaN(input.value) || input.value <= 0){// error
		input.value = 1;
	}
	var inputValue = input.value;
	var productID = this.getAttribute("data-original");
	for(var i = 0; i < cartItems.length; i++){
		if(productID == cartItems[i].mediaId){
			var item = {
				mediaId: cartItems[i].mediaId,
				qty: inputValue,
				size:cartItems[i].size,
				type:cartItems[i].type,
				color:cartItems[i].color,
				border: cartItems[i].border
			}
			updateCartItems.push(item);
			if(localStorage.length){
				var storageCartItems = JSON.parse(localStorage.getItem("cart"));
				for(var i = 0; i < storageCartItems.length; i++){
					if(item.mediaId !== storageCartItems[i].mediaId){
						updateCartItems.push(storageCartItems[i]);	
					}
				}
			}
			localStorage.clear();
			localStorage.setItem("cart", JSON.stringify(updateCartItems));
			updateCartItems = [];
			updateCartNumber();
			location.reload();
		}
	}
}

// DELETE ITEM FROM CART
function removeItem(productID){
	updateCartItems = [];
	for(var i = 0; i < cartItems.length; i++){
		if(productID !== cartItems[i].mediaId){
			updateCartItems.push(cartItems[i]);
		}
	}
	localStorage.setItem("cart", JSON.stringify(updateCartItems));
	updateCartItems = [];
	location.reload();
}

function pollDOM () {
  var deleteButton = document.querySelectorAll((".dangerButton"));
  var qtyInputButton = document.querySelectorAll(".qty");
  if (qtyInputButton.length) {
	  // console.log("adding quantityChanged");
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
	  total.textContent = "$"+totalPrice.toFixed(2);
  } else {
    setTimeout(pollDOM, 1000); // try again in 1000 milliseconds
  }
}

pollDOM();

// UPDATE CART NUMBER
function updateCartNumber(){
	var itemsInCart = document.getElementById("itemsInCart");
	itemsInCart.innerHTML = cartItems.length;
}

var stripe = Stripe('pk_live_51ItaMTBNTBHXjDNgW0uo7v0CXXntO0nOtCiTOZyZ8zB8MlpBnZpZNcaCMzC0UUVRwlD2kBzrzcpyjUQfWwzhvm1d00QAut0jNI');
      var checkoutButton = document.getElementById('checkout-button');

      checkoutButton.addEventListener('click', function() {
        // Create a new Checkout Session using the server-side endpoint you
        // created in step 3.
        fetch('/create-checkout-session', {
          method: 'POST',
		  headers: {
			"Content-type": "application/json; charset=UTF-8"
		  },
		  body: JSON.stringify({
				items: itemsToSend
			})
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(session) {
          return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function(result) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, you should display the localized error message to your
          // customer using `error.message`.
          if (result.error) {
            alert(result.error.message);
          }
        })
        .catch(function(error) {
          console.error('Error:', error);
		  // req.flash('error', err.message);
        });
      });
	
updateCartNumber();